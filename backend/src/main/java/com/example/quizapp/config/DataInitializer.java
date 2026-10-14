package com.example.quizapp.config;

import com.example.quizapp.entity.Category;
import com.example.quizapp.entity.User;
import com.example.quizapp.repository.CategoryRepository;
import com.example.quizapp.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(CategoryRepository categoryRepository,
                           UserRepository userRepository,
                           PasswordEncoder passwordEncoder) {
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // 1. Seed categories if empty
        if (categoryRepository.count() == 0) {
            List<Category> categories = Arrays.asList(
                    new Category("Programming", "General programming concepts, algorithms, and logic"),
                    new Category("Java", "Core Java, OOP, Collections, Multi-threading, and JVM concepts"),
                    new Category("Python", "Python syntax, data structures, libraries, and scripting"),
                    new Category("Web Development", "HTML, CSS, JavaScript, React, REST APIs, and backend architecture"),
                    new Category("Database Management", "SQL queries, normalization, transactions, and relational database systems"),
                    new Category("Operating Systems", "Processes, memory management, scheduling, file systems, and concurrency"),
                    new Category("Computer Networks", "OSI model, TCP/IP, protocols, routing, and network security"),
                    new Category("General Knowledge", "Current affairs, world history, geography, and science facts"),
                    new Category("Aptitude", "Quantitative analysis, logical reasoning, and verbal comprehension"),
                    new Category("Other", "Miscellaneous domains, technical topics, and trivia")
            );
            categoryRepository.saveAll(categories);
            System.out.println("✅ Seeded default categories");
        }

        // 2. Seed default users if not present
        if (!userRepository.existsByEmail("thouti06bhavishya@gmail.com")) {
            User student = new User();
            student.setFullName("Bhavishya Thouti");
            student.setEmail("thouti06bhavishya@gmail.com");
            student.setPassword(passwordEncoder.encode("Bhavishya29@"));
            userRepository.save(student);
            System.out.println("✅ Seeded student account: thouti06bhavishya@gmail.com");
        }

        if (!userRepository.existsByEmail("demo@quizmaster.com")) {
            User admin = new User();
            admin.setFullName("Prof. Alan Turing");
            admin.setEmail("demo@quizmaster.com");
            admin.setPassword(passwordEncoder.encode("password123"));
            userRepository.save(admin);
            System.out.println("✅ Seeded admin account: demo@quizmaster.com");
        }
    }
}
