package com.accounting.accounting.user.service;

import com.accounting.accounting.auth.service.JwtService;
import com.accounting.accounting.auth.service.RefreshTokenService;
import com.accounting.accounting.common.enums.UserForgetPwsStatusEnum;
import com.accounting.accounting.common.enums.UserPwsStatusEnum;
import com.accounting.accounting.common.enums.UserRefreshTokenStatusEnum;
import com.accounting.accounting.common.enums.UserStatusEnum;
import com.accounting.accounting.common.exception.AuthenticationFailedException;
import com.accounting.accounting.common.exception.BadRequestException;
import com.accounting.accounting.common.exception.ResourceNotFoundException;
import com.accounting.accounting.common.helper.Common;
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
import org.jspecify.annotations.NullMarked;
import org.jspecify.annotations.Nullable;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@NullMarked
@Service
@AllArgsConstructor
public class UserService implements UserDetailsService {
  private UserRepository userRepository;
  private UserPswRepository userPswRepository;
  private UserForgetPswRepository userForgetPswRepository;
  private UserRefreshTokenRepository userRefreshTokenRepository;
  private final PasswordEncoder encoder;
  private final JwtService jwtService;

  @Transactional
  public void create(UserCreateRequest req){
    // Check DB exist or not
    boolean exist = userRepository.existsByEmailIgnoreCaseAndIsActiveTrue(req.getEmail());
    if(exist){
      throw new BadRequestException("The email address is already registered in our system.");
    }

    // Save user email first
    User user = new User(req.getEmail());
    userRepository.save(user);

    setUserHashedPassword(user, req.getPassword().strip());
  }

  @Transactional
  public UserLoginResponse login(UserLoginRequest req){
    User user = userRepository.findByEmailIgnoreCaseAndIsActiveTrue(req.getEmail()).orElse(null);

    if(user == null){
      throw new AuthenticationFailedException("Email or password is incorrect.");
    }

    UserPsw userPsw = userPswRepository.findTopByUserIdOrderByCreatedAtDesc(user.getId()).orElse(null);
    if(userPsw == null){
      throw new AuthenticationFailedException("Email or password is incorrect.");
    }

    boolean isMatched = encoder.matches(req.getPassword(), userPsw.getHashedPassword());
    if(!isMatched){
      throw new AuthenticationFailedException("Email or password is incorrect.");
    }

    UserLoginResponse userLoginResponse = new UserLoginResponse();
    boolean hadPwsExp = userPsw.getStatus().equals(UserPwsStatusEnum.EXPIRED.getCode());
    boolean isPswExp = userPsw.getExpiredAt().isBefore(LocalDateTime.now());

    if(hadPwsExp || isPswExp){
      if(!hadPwsExp){
        userPsw.setStatus(UserPwsStatusEnum.EXPIRED.getCode());
        userPswRepository.save(userPsw);
      }

      updateOldPswTokenStatus(user);
      userLoginResponse.setResetPswToken(genResetPswToken(user).getToken());
      return userLoginResponse;
    }

    // Invalid all refresh token
    logout(user.getId());
    return genAccessAndRefreshToken(userLoginResponse, user);
  }

  public void resetPassword (String token, UserResetPswRequest req){
    UserForgetPsw userForgetPsw = userForgetPswRepository.findByToken(token)
        .orElseThrow( () -> new ResourceNotFoundException("Token not found"));

    if(!userForgetPsw.getStatus().equals(UserForgetPwsStatusEnum.ACTIVE.getCode())){
      throw new BadRequestException("Invalid Token");
    }
    setUserHashedPassword(userForgetPsw.getUser(), req.getPassword());

    userForgetPsw.setStatus(UserForgetPwsStatusEnum.INACTIVE.getCode());
    userForgetPswRepository.save(userForgetPsw);
  }

  public UserLoginResponse refreshToken(@Nullable String refreshTokenCookies){
    if(refreshTokenCookies == null) {
      throw new AuthenticationFailedException("Token invalid");
    }

    UserRefreshToken userRefreshToken = userRefreshTokenRepository
        .findByToken(refreshTokenCookies)
        .filter(token -> token.getStatus()
            .equals(UserRefreshTokenStatusEnum.ACTIVE.getCode()))
        .orElseThrow(() -> new AuthenticationFailedException("Token invalid"));

    if(userRefreshToken.getExpiredAt().isBefore(LocalDateTime.now())){
        userRefreshToken.setStatus(UserRefreshTokenStatusEnum.EXPIRED.getCode());
        userRefreshTokenRepository.save(userRefreshToken);
        throw new AuthenticationFailedException("Token invalid");
    }

    userRefreshToken.setStatus(UserRefreshTokenStatusEnum.USED.getCode());
    userRefreshTokenRepository.save(userRefreshToken);
    return genAccessAndRefreshToken(new UserLoginResponse(), userRefreshToken.getUser());
  }

  @Transactional
  public void logout(Long userId){
    List<UserRefreshToken> tokens = userRefreshTokenRepository.findByUserId(userId).orElseGet(List::of);
    if (tokens.isEmpty()) return;

    tokens.forEach(token ->
        token.setStatus(UserRefreshTokenStatusEnum.INACTIVE.getCode())
    );
    userRefreshTokenRepository.saveAll(tokens);
  }

  @Override
  public UserDetails loadUserByUsername(String email)
      throws UsernameNotFoundException {

    User user = userRepository.findByEmail(email)
        .orElseThrow(() ->
            new UsernameNotFoundException("User not found"));

    UserPsw userPsw = userPswRepository.findByUserIdAndStatus(user.getId(), UserStatusEnum.ACTIVE.getCode())
            .orElseThrow(() -> new UsernameNotFoundException("User password not found"));

    return new org.springframework.security.core.userdetails.User(
        user.getEmail(),
        userPsw.getHashedPassword(),
        Collections.emptyList()
    );
  }

  private void setUserHashedPassword(User user, String password){
    String hashedPassword = encoder.encode(password);
    if(hashedPassword == null)  throw new IllegalArgumentException("Password hash get null");

    // Save user password
    UserPsw userPsw = new UserPsw(hashedPassword, user, LocalDateTime.now().plusMonths(3));
    userPswRepository.save(userPsw);
  }

  // Get the previous token record if exist and update it to INACTIVE status
  private void updateOldPswTokenStatus (User user){
    UserForgetPsw oldUserForgetPsw = userForgetPswRepository.findTopByUserIdOrderByCreatedAtDesc(user.getId()).orElse(null);
    if(oldUserForgetPsw == null) return;

    if(oldUserForgetPsw.getStatus().equals(UserForgetPwsStatusEnum.ACTIVE.getCode())){
      oldUserForgetPsw.setStatus(UserForgetPwsStatusEnum.INACTIVE.getCode());
      userForgetPswRepository.save(oldUserForgetPsw);
    }
  }

  // Generate new token and return it
  private UserForgetPsw genResetPswToken(User user){
    SecureRandom secureRandom = new SecureRandom();
    byte[] bytes = new byte[32];   // 256-bit token
    secureRandom.nextBytes(bytes);

    String token = Base64.getUrlEncoder()
        .withoutPadding()
        .encodeToString(bytes);

    UserForgetPsw userForgetPsw = new UserForgetPsw(user, token, LocalDateTime.now().plusMinutes(3),
        UserForgetPwsStatusEnum.ACTIVE.getCode());
    return userForgetPswRepository.save(userForgetPsw);
  }

  // Generate and save hashed refresh token into DB
  private UserLoginResponse genAccessAndRefreshToken(UserLoginResponse userLoginResponse, User user){
    String accessToken = jwtService.generateToken(user.getId(), user.getEmail());
    String refreshToken = RefreshTokenService.genRefreshToken();

    userLoginResponse.setAccessToken(accessToken);


    // Save hashed refresh token into DB
    String hashedRefreshToken = encoder.encode(refreshToken);

    if(hashedRefreshToken == null)  throw new IllegalArgumentException("Refresh token hash get null");
    UserRefreshToken userRefreshToken = new UserRefreshToken(hashedRefreshToken, user, LocalDateTime.now().plusDays(7),
        UserRefreshTokenStatusEnum.ACTIVE.getCode());

    System.out.println(LocalDateTime.now());

    userRefreshTokenRepository.save(userRefreshToken);
    userLoginResponse.setRefreshToken(hashedRefreshToken);
    return userLoginResponse;
  }
}
