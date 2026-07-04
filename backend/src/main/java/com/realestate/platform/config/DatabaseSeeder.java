package com.realestate.platform.config;

import com.realestate.platform.model.*;
import com.realestate.platform.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
import java.util.*;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PropertyRepository propertyRepository;

    @Autowired
    private ContactMessageRepository contactMessageRepository;

    @Autowired
    private ChatRepository chatRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.findByEmail("admin@realestate.lk").isPresent()) {
            System.out.println("Sri Lankan mock data is already seeded (admin@realestate.lk found). Skipping seeder.");
            return;
        }

        System.out.println("admin@realestate.lk not found. Clearing old tables and seeding fresh Sri Lankan dataset...");
        userRepository.truncateWishlist();
        messageRepository.deleteAll();
        chatRepository.deleteAll();
        propertyRepository.deleteAll();
        userRepository.deleteAll();
        contactMessageRepository.deleteAll();

        seedUsers();
        seedProperties();
        seedContactMessages();
        seedChatsAndMessages();
    }

    private void seedUsers() {
        System.out.println("Seeding users...");

        // Encode password
        String encodedPassword = passwordEncoder.encode("password123");
        String adminPassword = passwordEncoder.encode("adminpassword");

        // Admin Account
        User admin = User.builder()
                .name("Admin Lanka")
                .email("admin@realestate.lk")
                .password(adminPassword)
                .phone("+94 11 234 5678")
                .role("admin")
                .blocked(false)
                .approved(true)
                .createdAt(LocalDateTime.now())
                .build();
        userRepository.save(admin);

        // 5 Sellers / Agents
        String[] sellerNames = {
                "Dilani Perera", "Roshan Silva", "Kusal Fernando", "Tharindu Jayasekara", "Menaka Gunawardena"
        };
        String[] sellerEmails = {
                "dilani@realestate.lk", "roshan@realestate.lk", "kusal@realestate.lk", "tharindu@realestate.lk", "menaka@realestate.lk"
        };
        String[] sellerPhones = {
                "+94 77 123 4567", "+94 71 987 6543", "+94 76 555 4321", "+94 72 444 8888", "+94 75 222 1111"
        };
        boolean[] sellerApprovals = {true, true, true, true, false}; // Menaka is pending approval

        for (int i = 0; i < sellerNames.length; i++) {
            User seller = User.builder()
                    .name(sellerNames[i])
                    .email(sellerEmails[i])
                    .password(encodedPassword)
                    .phone(sellerPhones[i])
                    .role("seller")
                    .blocked(false)
                    .approved(sellerApprovals[i])
                    .createdAt(LocalDateTime.now().minusDays(5 - i))
                    .build();
            userRepository.save(seller);
        }

        // 5 Buyers
        String[] buyerNames = {
                "Nimantha Fernando", "Sanduni Jayasinghe", "Ruwan Kumara", "Anusha Wickramasinghe", "Chamil Rajapaksa"
        };
        String[] buyerEmails = {
                "nimantha@realestate.lk", "sanduni@realestate.lk", "ruwan@realestate.lk", "anusha@realestate.lk", "chamil@realestate.lk"
        };
        String[] buyerPhones = {
                "+94 77 333 4444", "+94 71 222 3333", "+94 76 111 2222", "+94 72 777 6666", "+94 75 999 8888"
        };

        for (int i = 0; i < buyerNames.length; i++) {
            User buyer = User.builder()
                    .name(buyerNames[i])
                    .email(buyerEmails[i])
                    .password(encodedPassword)
                    .phone(buyerPhones[i])
                    .role("buyer")
                    .blocked(false)
                    .approved(true)
                    .createdAt(LocalDateTime.now().minusDays(10 - i))
                    .build();
            userRepository.save(buyer);
        }

        System.out.println("Seeded 11 users successfully.");
    }

    private void seedProperties() {
        System.out.println("Seeding properties...");

        // Fetch seeded sellers
        User dilani = userRepository.findByEmail("dilani@realestate.lk").orElse(null);
        User roshan = userRepository.findByEmail("roshan@realestate.lk").orElse(null);
        User kusal = userRepository.findByEmail("kusal@realestate.lk").orElse(null);
        User tharindu = userRepository.findByEmail("tharindu@realestate.lk").orElse(null);

        if (dilani == null || roshan == null || kusal == null || tharindu == null) {
            System.out.println("Error: Seeded sellers not found. Cannot seed properties.");
            return;
        }

        // Property 1: Colpetty Flat
        Property p1 = Property.builder()
                .title("Luxury 3BHK Apartment in Colpetty")
                .description("Located in the heart of Colombo 3, this premium apartment offers stunning ocean views, spacious bedrooms, a modern pantry, and access to a rooftop pool and gymnasium. 24/7 security and dedicated parking included.")
                .price(65000000.0) // 65 Million LKR
                .city("Colombo")
                .area("Colpetty (Colombo 3)")
                .pincode("00300")
                .propertyType("flat")
                .bhk("3")
                .bathrooms(3)
                .areaSize(1850.0)
                .furnishing("furnished")
                .status("sale")
                .seller(dilani)
                .verified(true)
                .views(45)
                .amenities(Arrays.asList("parking", "lift", "gym", "swimming pool", "security", "power backup"))
                .images(Arrays.asList(
                        "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
                        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80"
                ))
                .createdAt(LocalDateTime.now().minusDays(12))
                .build();
        propertyRepository.save(p1);

        // Property 2: Cinnamon Gardens Villa
        Property p2 = Property.builder()
                .title("Architect Designed Luxury Villa in Cinnamon Gardens")
                .description("An exquisite 5-bedroom villa situated in the exclusive Cinnamon Gardens neighborhood. Features a private landscaped garden, swimming pool, double height ceilings, teak flooring, and a state-of-the-art kitchen.")
                .price(180000000.0) // 180 Million LKR
                .city("Colombo")
                .area("Cinnamon Gardens (Colombo 7)")
                .pincode("00700")
                .propertyType("villa")
                .bhk("5")
                .bathrooms(5)
                .areaSize(4500.0)
                .furnishing("furnished")
                .status("sale")
                .seller(roshan)
                .verified(true)
                .views(120)
                .amenities(Arrays.asList("parking", "gym", "swimming pool", "security", "play area", "clubhouse"))
                .images(Arrays.asList(
                        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
                        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"
                ))
                .createdAt(LocalDateTime.now().minusDays(10))
                .build();
        propertyRepository.save(p2);

        // Property 3: Galle Fort Penthouse
        Property p3 = Property.builder()
                .title("Historic Penthouse with Ocean Views in Galle Fort")
                .description("A rare opportunity to own a penthouse inside the UNESCO World Heritage Galle Fort. Features colonial architecture blended with modern amenities, open terraces overlooking the Indian Ocean, and wooden beams.")
                .price(110000000.0) // 110 Million LKR
                .city("Galle")
                .area("Galle Fort")
                .pincode("80000")
                .propertyType("penthouse")
                .bhk("3")
                .bathrooms(2)
                .areaSize(2200.0)
                .furnishing("furnished")
                .status("sale")
                .seller(kusal)
                .verified(true)
                .views(67)
                .amenities(Arrays.asList("parking", "security", "power backup"))
                .images(Arrays.asList(
                        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80",
                        "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=800&q=80"
                ))
                .createdAt(LocalDateTime.now().minusDays(8))
                .build();
        propertyRepository.save(p3);

        // Property 4: Negombo Commercial Building
        Property p4 = Property.builder()
                .title("Prime Commercial Building Near Negombo Beach Road")
                .description("Ideal for a showroom, tourist hotel or corporate office. Located on a highly commercialized stretch of Negombo beach road with high foot traffic. 3 floors, open plan layout, ample customer parking.")
                .price(145000000.0) // 145 Million LKR
                .city("Negombo")
                .area("Negombo Beach Road")
                .pincode("11500")
                .propertyType("commercial")
                .bhk("N/A")
                .bathrooms(4)
                .areaSize(6000.0)
                .furnishing("unfurnished")
                .status("sale")
                .seller(tharindu)
                .verified(false)
                .views(15)
                .amenities(Arrays.asList("parking", "lift", "security", "power backup"))
                .images(Arrays.asList(
                        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
                        "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80"
                ))
                .createdAt(LocalDateTime.now().minusDays(3))
                .build();
        propertyRepository.save(p4);

        // Property 5: Rajagiriya Flat
        Property p5 = Property.builder()
                .title("Modern 2BHK Apartment at Rajagiriya Skyline")
                .description("Located on a high floor of a newly completed high-rise in Rajagiriya. Convenient access to Colombo, central air conditioning, backup generator, infinity pool, and jogging track.")
                .price(38000000.0) // 38 Million LKR
                .city("Rajagiriya")
                .area("Rajagiriya")
                .pincode("10100")
                .propertyType("flat")
                .bhk("2")
                .bathrooms(2)
                .areaSize(1150.0)
                .furnishing("semi-furnished")
                .status("sale")
                .seller(dilani)
                .verified(true)
                .views(33)
                .amenities(Arrays.asList("parking", "lift", "gym", "swimming pool", "security"))
                .images(Arrays.asList(
                        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80"
                ))
                .createdAt(LocalDateTime.now().minusDays(5))
                .build();
        propertyRepository.save(p5);

        // Property 6: Mount Lavinia Villa
        Property p6 = Property.builder()
                .title("Beachfront House in Mount Lavinia")
                .description("Beautiful beach house located just steps away from the Mount Lavinia beach. Features 4 bedrooms, cozy courtyard, spacious balconies facing the sea, and separate maid's quarters.")
                .price(55000000.0) // 55 Million LKR
                .city("Mount Lavinia")
                .area("Mount Lavinia")
                .pincode("10370")
                .propertyType("villa")
                .bhk("4")
                .bathrooms(3)
                .areaSize(2800.0)
                .furnishing("semi-furnished")
                .status("sale")
                .seller(roshan)
                .verified(true)
                .views(52)
                .amenities(Arrays.asList("parking", "security", "play area"))
                .images(Arrays.asList(
                        "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80"
                ))
                .createdAt(LocalDateTime.now().minusDays(7))
                .build();
        propertyRepository.save(p6);

        // Property 7: Kandy House
        Property p7 = Property.builder()
                .title("Scenic Hilltop Bungalow in Kandy")
                .description("Situated in the hills of Kandy with panoramic mountain views. Surrounded by lush greenery, featuring large windows, fireplace, wooden deck, and 4 bedrooms.")
                .price(42000000.0) // 42 Million LKR
                .city("Kandy")
                .area("Peradeniya Road")
                .pincode("20000")
                .propertyType("villa")
                .bhk("4")
                .bathrooms(4)
                .areaSize(3200.0)
                .furnishing("semi-furnished")
                .status("sale")
                .seller(kusal)
                .verified(false)
                .views(24)
                .amenities(Arrays.asList("parking", "security", "clubhouse"))
                .images(Arrays.asList(
                        "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80"
                ))
                .createdAt(LocalDateTime.now().minusDays(4))
                .build();
        propertyRepository.save(p7);

        // Property 8: Battaramulla Flat
        Property p8 = Property.builder()
                .title("Spacious 3BHK Apartment in Battaramulla")
                .description("Beautiful residential apartment in Battaramulla close to government offices and international schools. Quiet neighborhood, high quality finishes, and secure gated community.")
                .price(32500000.0) // 32.5 Million LKR
                .city("Battaramulla")
                .area("Battaramulla")
                .pincode("10120")
                .propertyType("flat")
                .bhk("3")
                .bathrooms(2)
                .areaSize(1450.0)
                .furnishing("unfurnished")
                .status("sale")
                .seller(tharindu)
                .verified(true)
                .views(29)
                .amenities(Arrays.asList("parking", "lift", "security"))
                .images(Arrays.asList(
                        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80"
                ))
                .createdAt(LocalDateTime.now().minusDays(6))
                .build();
        propertyRepository.save(p8);

        // Property 9: Colombo 5 Penthouse
        Property p9 = Property.builder()
                .title("Superb Penthouse with City Views in Havelock Town")
                .description("An ultra-luxury duplex penthouse located in Havelock Town, Colombo 5. Features massive rooftop deck, glass floor panels, state of the art automation, private lift access, and panoramic city views.")
                .price(165000000.0) // 165 Million LKR
                .city("Colombo")
                .area("Havelock Town (Colombo 5)")
                .pincode("00500")
                .propertyType("penthouse")
                .bhk("4")
                .bathrooms(4)
                .areaSize(3800.0)
                .furnishing("furnished")
                .status("sale")
                .seller(dilani)
                .verified(true)
                .views(88)
                .amenities(Arrays.asList("parking", "lift", "gym", "swimming pool", "security", "power backup", "clubhouse"))
                .images(Arrays.asList(
                        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80"
                ))
                .createdAt(LocalDateTime.now().minusDays(9))
                .build();
        propertyRepository.save(p9);

        // Property 10: Kurunegala Shop
        Property p10 = Property.builder()
                .title("Commercial Shop Space in Central Kurunegala")
                .description("Located on the busy main street of Kurunegala. Perfect for retail outlets, bank branches, or service centers. Ground floor access, wide glass front, high visibility.")
                .price(28000000.0) // 28 Million LKR
                .city("Kurunegala")
                .area("Kurunegala Town")
                .pincode("60000")
                .propertyType("commercial")
                .bhk("N/A")
                .bathrooms(2)
                .areaSize(1800.0)
                .furnishing("unfurnished")
                .status("sale")
                .seller(roshan)
                .verified(true)
                .views(19)
                .amenities(Arrays.asList("parking", "security"))
                .images(Arrays.asList(
                        "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80"
                ))
                .createdAt(LocalDateTime.now().minusDays(11))
                .build();
        propertyRepository.save(p10);

        // Property 11: Wattala Villa
        Property p11 = Property.builder()
                .title("Modern Gated Community House in Wattala")
                .description("Newly built modern 4-bedroom house in a secure gated community in Wattala. Close proximity to the highway entry, supermarkets, and schools. 24-hour security.")
                .price(48000000.0) // 48 Million LKR
                .city("Wattala")
                .area("Wattala")
                .pincode("11300")
                .propertyType("villa")
                .bhk("4")
                .bathrooms(3)
                .areaSize(2600.0)
                .furnishing("semi-furnished")
                .status("sale")
                .seller(kusal)
                .verified(true)
                .views(41)
                .amenities(Arrays.asList("parking", "security", "play area"))
                .images(Arrays.asList(
                        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"
                ))
                .createdAt(LocalDateTime.now().minusDays(13))
                .build();
        propertyRepository.save(p11);

        // Property 12: Jaffna House
        Property p12 = Property.builder()
                .title("Traditional Style Spacious House in Jaffna")
                .description("Spacious family home in Jaffna town featuring a large traditional courtyard (Muttram), well-maintained well water system, and modern internal upgrades. 5 bedrooms, high security wall.")
                .price(35000000.0) // 35 Million LKR
                .city("Jaffna")
                .area("Jaffna Town")
                .pincode("40000")
                .propertyType("villa")
                .bhk("5")
                .bathrooms(3)
                .areaSize(3500.0)
                .furnishing("semi-furnished")
                .status("sold")
                .seller(tharindu)
                .verified(true)
                .views(57)
                .amenities(Arrays.asList("parking", "security"))
                .images(Arrays.asList(
                        "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&w=800&q=80"
                ))
                .createdAt(LocalDateTime.now().minusDays(15))
                .build();
        propertyRepository.save(p12);

        System.out.println("Seeded 12 Sri Lankan property listings successfully.");
    }

    private void seedContactMessages() {
        System.out.println("Seeding contact messages...");

        String[] names = {
                "Pradeep Perera", "Nilmini Silva", "Mahela Jayawardene", "Ruvini De Silva", "Sanath Jayasuriya",
                "Dilhara Fernando", "Chandra Wickramasinghe", "Indika Jayasinghe", "Gayani Alwis", "Lakshan Sandakan",
                "Priyantha Jayakody"
        };
        String[] emails = {
                "pradeep@gmail.lk", "nilmini@gmail.lk", "mahela@gmail.com", "ruvini@yahoo.com", "sanath@cricket.lk",
                "dilhara@gmail.com", "chandra@gmail.lk", "indika@live.lk", "gayani@gmail.com", "lakshan@gmail.com",
                "priyantha@gmail.lk"
        };
        String[] phones = {
                "+94 77 111 2222", "+94 71 333 4444", "+94 76 555 6666", "+94 72 888 9999", "+94 77 999 0000",
                "+94 75 111 5555", "+94 71 777 8888", "+94 76 222 3333", "+94 72 444 5555", "+94 77 888 1111",
                "+94 75 444 3333"
        };
        String[] roles = {
                "buyer", "seller", "buyer", "buyer", "seller", "buyer", "buyer", "seller", "buyer", "buyer", "buyer"
        };
        String[] messages = {
                "I want to inspect Cinnamon Gardens Villa. Please contact me.",
                "How long does it take for listing approval?",
                "Interested in the Galle Fort Penthouse. Is the price negotiable?",
                "Are there any flat properties in Rajagiriya for under 40 Million LKR?",
                "I want to register as an agent. What are the documents required?",
                "Is parking available at the Colpetty apartment?",
                "Looking for commercial spaces in Negombo. Please share listings.",
                "My account is still pending approval. Can you check please?",
                "Please send more photos of Kandy Hilltop Bungalow.",
                "Can I get home loan assistance for Jaffna house?",
                "I want to view the Wattala gated community house this weekend."
        };

        for (int i = 0; i < names.length; i++) {
            ContactMessage msg = ContactMessage.builder()
                    .name(names[i])
                    .email(emails[i])
                    .phone(phones[i])
                    .role(roles[i])
                    .message(messages[i])
                    .createdAt(LocalDateTime.now().minusDays(10 - i))
                    .build();
            contactMessageRepository.save(msg);
        }

        System.out.println("Seeded 11 support contact messages successfully.");
    }

    private void seedChatsAndMessages() {
        System.out.println("Seeding chats and messages...");

        // Fetch seeded buyers and sellers
        User nimantha = userRepository.findByEmail("nimantha@realestate.lk").orElse(null);
        User sanduni = userRepository.findByEmail("sanduni@realestate.lk").orElse(null);
        User dilani = userRepository.findByEmail("dilani@realestate.lk").orElse(null);
        User roshan = userRepository.findByEmail("roshan@realestate.lk").orElse(null);

        // Fetch properties
        List<Property> properties = propertyRepository.findAll();
        if (properties.isEmpty() || nimantha == null || sanduni == null || dilani == null || roshan == null) {
            System.out.println("Error: Required entities for chat seeding missing. Skipping.");
            return;
        }

        Property colpettyApartment = properties.stream()
                .filter(p -> p.getTitle().contains("Colpetty"))
                .findFirst().orElse(properties.get(0));

        Property cinnamonVilla = properties.stream()
                .filter(p -> p.getTitle().contains("Cinnamon Gardens"))
                .findFirst().orElse(properties.get(1));

        // Chat 1: Nimantha & Dilani about Colpetty Apartment
        Chat chat1 = Chat.builder()
                .buyer(nimantha)
                .seller(dilani)
                .property(colpettyApartment)
                .messages(new ArrayList<>())
                .createdAt(LocalDateTime.now().minusDays(4))
                .build();
        Chat savedChat1 = chatRepository.save(chat1);

        Message m1 = Message.builder()
                .chat(savedChat1)
                .sender(nimantha)
                .text("Hi Dilani, I would like to schedule a visit to the Colpetty apartment.")
                .read(true)
                .createdAt(LocalDateTime.now().minusDays(4).plusHours(2))
                .build();
        messageRepository.save(m1);

        Message m2 = Message.builder()
                .chat(savedChat1)
                .sender(dilani)
                .text("Hello Nimantha, sure! We can arrange a visit this Saturday morning at 10 AM. Does that work?")
                .read(true)
                .createdAt(LocalDateTime.now().minusDays(4).plusHours(3))
                .build();
        messageRepository.save(m2);

        Message m3 = Message.builder()
                .chat(savedChat1)
                .sender(nimantha)
                .text("Yes, Saturday 10 AM is perfect. Can you send the exact building name?")
                .read(true)
                .createdAt(LocalDateTime.now().minusDays(3).plusHours(1))
                .build();
        messageRepository.save(m3);

        Message m4 = Message.builder()
                .chat(savedChat1)
                .sender(dilani)
                .text("It is Ocean Breeze Residency, Colombo 3. See you on Saturday!")
                .read(false)
                .createdAt(LocalDateTime.now().minusDays(3).plusHours(2))
                .build();
        messageRepository.save(m4);

        // Chat 2: Sanduni & Roshan about Cinnamon Gardens Villa
        Chat chat2 = Chat.builder()
                .buyer(sanduni)
                .seller(roshan)
                .property(cinnamonVilla)
                .messages(new ArrayList<>())
                .createdAt(LocalDateTime.now().minusDays(2))
                .build();
        Chat savedChat2 = chatRepository.save(chat2);

        Message m5 = Message.builder()
                .chat(savedChat2)
                .sender(sanduni)
                .text("Hi Roshan, is the Cinnamon Gardens villa still available?")
                .read(true)
                .createdAt(LocalDateTime.now().minusDays(2).plusHours(1))
                .build();
        messageRepository.save(m5);

        Message m6 = Message.builder()
                .chat(savedChat2)
                .sender(roshan)
                .text("Yes, Sanduni, it is available. Would you like to check the floor plan?")
                .read(true)
                .createdAt(LocalDateTime.now().minusDays(2).plusHours(2))
                .build();
        messageRepository.save(m6);

        Message m7 = Message.builder()
                .chat(savedChat2)
                .sender(sanduni)
                .text("Yes, please send me the details and photos.")
                .read(false)
                .createdAt(LocalDateTime.now().minusDays(1).plusHours(4))
                .build();
        messageRepository.save(m7);

        System.out.println("Seeded chats and messages successfully.");
    }
}
