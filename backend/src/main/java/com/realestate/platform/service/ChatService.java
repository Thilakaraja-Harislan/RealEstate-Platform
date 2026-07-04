package com.realestate.platform.service;

import com.realestate.platform.model.Chat;
import com.realestate.platform.model.Property;
import com.realestate.platform.model.User;
import com.realestate.platform.repository.ChatRepository;
import com.realestate.platform.repository.PropertyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ChatService {

    @Autowired
    private ChatRepository chatRepository;

    @Autowired
    private PropertyRepository propertyRepository;

    public List<Chat> getChatsForUser(User user) {
        return chatRepository.findChatsByUser(user);
    }

    public Optional<Chat> getChatById(Long id) {
        return chatRepository.findById(id);
    }

    public Chat createOrGetChat(Long propertyId, User buyer, User seller) {
        Optional<Chat> existingChat = chatRepository.findByBuyerAndSeller(buyer, seller);
        if (existingChat.isPresent()) {
            return existingChat.get();
        }

        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new IllegalArgumentException("Property not found with id: " + propertyId));

        Chat newChat = Chat.builder()
                .property(property)
                .buyer(buyer)
                .seller(seller)
                .messages(new ArrayList<>())
                .createdAt(LocalDateTime.now())
                .build();

        return chatRepository.save(newChat);
    }
}
