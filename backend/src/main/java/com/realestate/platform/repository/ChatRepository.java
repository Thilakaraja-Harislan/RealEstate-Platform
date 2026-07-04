package com.realestate.platform.repository;

import com.realestate.platform.model.Chat;
import com.realestate.platform.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRepository extends JpaRepository<Chat, Long> {
    Optional<Chat> findByBuyerAndSeller(User buyer, User seller);

    @Query("SELECT c FROM Chat c WHERE c.buyer = :user OR c.seller = :user ORDER BY c.createdAt DESC")
    List<Chat> findChatsByUser(@Param("user") User user);
}
