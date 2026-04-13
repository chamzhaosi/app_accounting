package com.accounting.accounting.user.service;

import com.accounting.accounting.user.entity.User;
import com.accounting.accounting.user.entity.UserLgn;
import com.accounting.accounting.user.repository.UserLgnRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@AllArgsConstructor
public class UserServiceUtils {
    private UserLgnRepository userLgnRepository;

    @Transactional(Transactional.TxType.REQUIRES_NEW)
    public void updateUserWrongPasswordCount(User user) {
        log.info("[UserService] - Update user wrong password failed count");
        UserLgn userLgn = userLgnRepository.findTopByUserIdOrderByCreatedAtDesc(user.getId())
                .orElse(new UserLgn(user, 0L, user.getEmail()));
        userLgn.setFailedCount(userLgn.getFailedCount() + 1);
        userLgnRepository.save(userLgn);
    }
}
