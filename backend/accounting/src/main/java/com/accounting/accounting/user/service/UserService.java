package com.accounting.accounting.user.service;

import com.accounting.accounting.auth.service.JwtService;
import com.accounting.accounting.auth.service.RefreshTokenService;
import com.accounting.accounting.common.enums.ExceptionEnum;
import com.accounting.accounting.common.enums.UserForgetPwsStatusEnum;
import com.accounting.accounting.common.enums.UserPwsStatusEnum;
import com.accounting.accounting.common.enums.UserRefreshTokenStatusEnum;
import com.accounting.accounting.common.enums.UserStatusEnum;
import com.accounting.accounting.common.exception.AuthenticationFailedException;
import com.accounting.accounting.common.exception.EmailAlreadyExistsException;
import com.accounting.accounting.common.exception.InvalidArgumentException;
import com.accounting.accounting.user.dto.UserCreateRequest;
import com.accounting.accounting.user.dto.UserLoginRequest;
import com.accounting.accounting.user.dto.UserLoginResponse;
import com.accounting.accounting.user.dto.UserResetPswRequest;
import com.accounting.accounting.user.entity.User;
import com.accounting.accounting.user.entity.UserForgetPsw;
import com.accounting.accounting.user.entity.UserPsw;
import com.accounting.accounting.user.entity.UserRefreshToken;
import com.accounting.accounting.user.repository.UserForgetPswRepository;
import com.accounting.accounting.user.repository.UserPswRepository;
import com.accounting.accounting.user.repository.UserRefreshTokenRepository;
import com.accounting.accounting.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Collections;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NullMarked;
import org.jspecify.annotations.Nullable;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Slf4j
@NullMarked
@Service
@AllArgsConstructor
public class UserService implements UserDetailsService {
  private UserRepository userRepository;
  private UserPswRepository userPswRepository;
  private UserForgetPswRepository userForgetPswRepository;
  private UserRefreshTokenRepository userRefreshTokenRepository;
  private UserServiceUtils userServiceUtils;
  private final PasswordEncoder encoder;
  private final JwtService jwtService;

  @Transactional
  public void create(UserCreateRequest req){
    String email = req.getEmail();
    String password = req.getPassword();

    // Make sure the email hasn't been register yet
    log.info("[UserService][Create] - Create new account with email ({})", email);
    boolean exist = userRepository.existsByEmailIgnoreCaseAndIsActiveTrue(email);
    if(exist){
      log.error("[UserService][Create] - Same email ({}) found in DB.", email);
      throw new EmailAlreadyExistsException();
    }

    // Save user email first
    User user = new User(email);
    userRepository.save(user);

    setUserHashedPassword(user, password.strip());
    log.info("[UserService][Create] - Create new account with email ({}) successfully", email);
  }

  @Transactional
  public UserLoginResponse login(UserLoginRequest req){
    String email = req.getEmail();
    String password = req.getPassword();
    AuthenticationFailedException authException = new AuthenticationFailedException();

    log.info("[UserService][Login] - User email ({}) login", email);
    User user = userRepository.findByEmailIgnoreCaseAndIsActiveTrue(email).orElse(null);

    if(user == null){
      log.error("[UserService][Login] - Email ({}) not found", email);
      throw authException;
    }

    UserPsw userPsw = userPswRepository.findTopByUserIdOrderByCreatedAtDesc(user.getId()).orElse(null);
    if(userPsw == null){
      log.error("[UserService][Login] - User hashed password not found");
      throw authException;
    }

    boolean isMatched = encoder.matches(password, userPsw.getHashedPassword());
    if(!isMatched){
      log.error("[UserService][Login] - User password not match");
      userServiceUtils.updateUserWrongPasswordCount(user);
      throw authException;
    }

    UserLoginResponse userLoginResponse = new UserLoginResponse();
    boolean hadPwsExp = userPsw.getStatus().equals(UserPwsStatusEnum.EXPIRED.getCode());
    boolean isPswExp = userPsw.getExpiredAt().isBefore(LocalDateTime.now());

    if(hadPwsExp || isPswExp){
      log.warn("[UserService][Login] - User password has been expired.");
      if(!hadPwsExp){
        log.info("[UserService][Login] - Update user password to expired.");
        userPsw.setStatus(UserPwsStatusEnum.EXPIRED.getCode());
        userPswRepository.save(userPsw);
      }

      updateOldPswTokenStatus(user);
      userLoginResponse.setResetPswToken(genResetPswToken(user).getToken());
      return userLoginResponse;
    }

    // Invalid all refresh token
    updateRefreshTokenToInactive(user.getId());
    return genAccessAndRefreshToken(userLoginResponse, user);
  }

  public void resetPassword (String token, UserResetPswRequest req){
    log.info("[UserService][ResetPassword] - Reset user password by {}, and update toke to inactive", token);

    UserForgetPsw userForgetPsw = userForgetPswRepository.findByToken(token)
        .filter(t -> t.getStatus().equals(UserForgetPwsStatusEnum.ACTIVE.getCode()))
        .orElseThrow( () -> new InvalidArgumentException(ExceptionEnum.INVALID_RESET_PASSWORD_TOKEN));

    setUserHashedPassword(userForgetPsw.getUser(), req.getPassword());

    userForgetPsw.setStatus(UserForgetPwsStatusEnum.INACTIVE.getCode());
    userForgetPswRepository.save(userForgetPsw);
  }

  public UserLoginResponse refreshToken(@Nullable String refreshTokenCookies){
    log.info("[UserService][RefreshToken] - Checking the validation of refresh token and generate new access and refresh token");

    InvalidArgumentException ivlArgException = new InvalidArgumentException(ExceptionEnum.INVALID_RESET_PASSWORD_TOKEN);

    if(refreshTokenCookies == null) {
      throw ivlArgException;
    }

    UserRefreshToken userRefreshToken = userRefreshTokenRepository
        .findByToken(refreshTokenCookies)
        .filter(token -> token.getStatus()
            .equals(UserRefreshTokenStatusEnum.ACTIVE.getCode()))
        .filter(token -> {
          if(token.getExpiredAt().isBefore(LocalDateTime.now())){
            token.setStatus(UserRefreshTokenStatusEnum.EXPIRED.getCode());
            userRefreshTokenRepository.save(token);
            return false;
          }
          return true;
        })
        .orElseThrow(() -> ivlArgException);

    userRefreshToken.setStatus(UserRefreshTokenStatusEnum.USED.getCode());
    userRefreshTokenRepository.save(userRefreshToken);
    return genAccessAndRefreshToken(new UserLoginResponse(), userRefreshToken.getUser());
  }

  @Transactional
  public void logout(Long userId){
    log.info("[UserService][Logout] - User logout");
    updateRefreshTokenToInactive(userId);
  }

  @Override
  public UserDetails loadUserByUsername(String email)
      throws AuthenticationFailedException {
    log.info("[UserService] - Load user info by email ({}) for JWT use", email);

    AuthenticationFailedException authenticationFailedException = new AuthenticationFailedException(
        ExceptionEnum.INCORRECT_JWT_USERINFO.name(),
        ExceptionEnum.INCORRECT_JWT_USERINFO.getMessage()
    );

    User user = userRepository.findByEmail(email)
        .orElseThrow(() ->
            authenticationFailedException);

    UserPsw userPsw = userPswRepository.findByUserIdAndStatus(user.getId(), UserStatusEnum.ACTIVE.getCode())
            .orElseThrow(() -> authenticationFailedException);

    return new org.springframework.security.core.userdetails.User(
        user.getEmail(),
        userPsw.getHashedPassword(),
        Collections.emptyList()
    );
  }

  private void setUserHashedPassword(User user, String password){
    log.info("[UserService] - Hashed user password.");
    String hashedPassword = encoder.encode(password);

    if(hashedPassword == null) {
      log.error("[UserService]- Encode user password but get null.");
      throw new InvalidArgumentException(ExceptionEnum.ENCODE_USER_PASSWORD_BUT_GET_NULL_VALUE);
    };

    // Save user password
    log.info("[UserService] - Save user hashed password into DB.");
    UserPsw userPsw = new UserPsw(hashedPassword, user);
    userPswRepository.save(userPsw);
  }

  // Get the previous token record if exist and update it to INACTIVE status
  private void updateOldPswTokenStatus (User user){
    log.info("[UserService] - Update those previously reset token to inactive");
    userForgetPswRepository.findTopByUserIdOrderByCreatedAtDesc(user.getId())
        .filter(token -> token.getStatus().equals(UserForgetPwsStatusEnum.ACTIVE.getCode()))
        .ifPresent(token -> {
          token.setStatus(UserForgetPwsStatusEnum.INACTIVE.getCode());
          userForgetPswRepository.save(token);
        });
  }

  // Generate new token and return it
  private UserForgetPsw genResetPswToken(User user){
    log.info("[UserService] - Generate new reset password token and save into DB");
    SecureRandom secureRandom = new SecureRandom();
    byte[] bytes = new byte[32];   // 256-bit token
    secureRandom.nextBytes(bytes);

    String token = Base64.getUrlEncoder()
        .withoutPadding()
        .encodeToString(bytes);

    UserForgetPsw userForgetPsw = new UserForgetPsw(user, token);
    return userForgetPswRepository.save(userForgetPsw);
  }

  // Generate and save hashed refresh token into DB
  private UserLoginResponse genAccessAndRefreshToken(UserLoginResponse userLoginResponse, User user){
    log.info("[UserService] - Generate JWT access and refresh token, and save refresh token into DB");
    String accessToken = jwtService.generateToken(user.getId(), user.getEmail());
    String refreshToken = RefreshTokenService.genRefreshToken();

    userLoginResponse.setAccessToken(accessToken);

    String hashedRefreshToken = encoder.encode(refreshToken);
    if(hashedRefreshToken == null)  throw new InvalidArgumentException(ExceptionEnum.ENCODE_REFRESH_TOKEN_BUT_GET_NULL_VALUE);

    UserRefreshToken userRefreshToken = new UserRefreshToken(user, hashedRefreshToken);

    userRefreshTokenRepository.save(userRefreshToken);
    userLoginResponse.setRefreshToken(hashedRefreshToken);
    return userLoginResponse;
  }

  private void updateRefreshTokenToInactive(Long userId) {
    log.info("[UserService] - Update those refresh token to inactive status if any");
    List<UserRefreshToken> tokens = userRefreshTokenRepository.findByUserId(userId).orElseGet(List::of);
    if (tokens.isEmpty()) return;

    tokens.forEach(token ->
        token.setStatus(UserRefreshTokenStatusEnum.INACTIVE.getCode())
    );
    userRefreshTokenRepository.saveAll(tokens);
  }
}