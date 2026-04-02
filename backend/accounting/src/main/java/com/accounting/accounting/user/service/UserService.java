package com.accounting.accounting.user.service;

import com.accounting.accounting.common.enums.UserForgetPwsStatusEnum;
import com.accounting.accounting.common.enums.UserPwsStatusEnum;
import com.accounting.accounting.common.exception.AuthenticationFailedException;
import com.accounting.accounting.common.exception.BadRequestException;
import com.accounting.accounting.common.exception.ResourceNotFoundException;
import com.accounting.accounting.user.dto.UserCreateRequest;
import com.accounting.accounting.user.dto.UserLoginRequest;
import com.accounting.accounting.user.dto.UserResetPswRequest;
import com.accounting.accounting.user.entity.User;
import com.accounting.accounting.user.entity.UserForgetPsw;
import com.accounting.accounting.user.entity.UserPsw;
import com.accounting.accounting.user.repository.UserForgetPswRepository;
import com.accounting.accounting.user.repository.UserPswRepository;
import com.accounting.accounting.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Optional;
import lombok.AllArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.MethodArgumentNotValidException;

@Service
@AllArgsConstructor
public class UserService {
  private UserRepository userRepository;
  private UserPswRepository userPswRepository;
  private UserForgetPswRepository userForgetPswRepository;
  private final PasswordEncoder encoder;

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
  public Optional<String> login(UserLoginRequest req){
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

    boolean hadPwsExp = userPsw.getStatus().equals(UserPwsStatusEnum.EXPIRED.getCode());
    boolean isPswExp = userPsw.getExpiredAt().isBefore(LocalDateTime.now());

    if(hadPwsExp || isPswExp){
      if(!hadPwsExp){
        userPsw.setStatus(UserPwsStatusEnum.EXPIRED.getCode());
        userPswRepository.save(userPsw);
      }

      updateOldPswTokenStatus(user);
      return Optional.of(genResetPswToken(user).getToken());
    }

    return Optional.empty();
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

}
