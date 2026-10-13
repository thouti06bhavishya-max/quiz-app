package com.example.quizapp.config;

import com.example.quizapp.entity.Category;
import com.example.quizapp.entity.Question;
import com.example.quizapp.entity.Quiz;
import com.example.quizapp.entity.User;
import com.example.quizapp.repository.CategoryRepository;
import com.example.quizapp.repository.QuestionRepository;
import com.example.quizapp.repository.QuizRepository;
import com.example.quizapp.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(CategoryRepository categoryRepository,
                           UserRepository userRepository,
                           QuizRepository quizRepository,
                           QuestionRepository questionRepository,
                           PasswordEncoder passwordEncoder) {
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.quizRepository = quizRepository;
        this.questionRepository = questionRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        // 1. Seed Categories if empty
        if (categoryRepository.count() == 0) {
            List<Category> categories = List.of(
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
        }

        // 2. Seed Demo User and Sample Quizzes if no users exist
        if (userRepository.count() == 0) {
            User demoUser = new User();
            demoUser.setFullName("Prof. Alan Turing");
            demoUser.setEmail("demo@quizmaster.com");
            demoUser.setPassword(passwordEncoder.encode("password123"));
            User savedDemo = userRepository.save(demoUser);

            Category javaCat = categoryRepository.findByNameIgnoreCase("Java")
                    .orElse(categoryRepository.findAll().get(0));
            Category webCat = categoryRepository.findByNameIgnoreCase("Web Development")
                    .orElse(categoryRepository.findAll().get(0));

            // Quiz 1: Java OOP
            Quiz javaQuiz = new Quiz();
            javaQuiz.setTitle("Core Java & OOP Fundamentals");
            javaQuiz.setDescription("Assess your foundational knowledge of Object-Oriented Programming, Polymorphism, and Java Class structures.");
            javaQuiz.setCategory(javaCat);
            javaQuiz.setDifficulty(Quiz.Difficulty.MEDIUM);
            javaQuiz.setCreator(savedDemo);
            javaQuiz.setDurationMinutes(15);
            javaQuiz.setTotalMarks(10);
            javaQuiz.setPassingMarks(6);
            javaQuiz.setNegativeMarkingEnabled(false);
            javaQuiz.setNegativeMarksPerWrong(BigDecimal.ZERO);
            javaQuiz.setQuestionCount(5);
            javaQuiz.setStatus(Quiz.QuizStatus.PUBLISHED);
            Quiz savedJavaQuiz = quizRepository.save(javaQuiz);

            List<Question> javaQuestions = new ArrayList<>();

            Question q1 = new Question();
            q1.setQuiz(savedJavaQuiz);
            q1.setQuestionText("Which OOP concept allows a subclass to provide a specific implementation of a method that is already defined in its superclass?");
            q1.setOptionA("Encapsulation");
            q1.setOptionB("Method Overriding");
            q1.setOptionC("Method Overloading");
            q1.setOptionD("Data Abstraction");
            q1.setCorrectAnswer(Question.CorrectOption.B);
            q1.setMarks(2);
            q1.setExplanation("Method Overriding occurs when a child class provides a specific implementation of an inherited method with identical signature.");
            q1.setQuestionOrder(1);
            javaQuestions.add(q1);

            Question q2 = new Question();
            q2.setQuiz(savedJavaQuiz);
            q2.setQuestionText("What is the default value of a boolean variable declared as a class instance field in Java?");
            q2.setOptionA("true");
            q2.setOptionB("null");
            q2.setOptionC("false");
            q2.setOptionD("0");
            q2.setCorrectAnswer(Question.CorrectOption.C);
            q2.setMarks(2);
            q2.setExplanation("Uninitialized boolean instance variables in Java default to false.");
            q2.setQuestionOrder(2);
            javaQuestions.add(q2);

            Question q3 = new Question();
            q3.setQuiz(savedJavaQuiz);
            q3.setQuestionText("Which keyword prevents a class from being subclassed (inherited) in Java?");
            q3.setOptionA("static");
            q3.setOptionB("final");
            q3.setOptionC("abstract");
            q3.setOptionD("sealed");
            q3.setCorrectAnswer(Question.CorrectOption.B);
            q3.setMarks(2);
            q3.setExplanation("Marking a class as 'final' prevents any other class from extending it.");
            q3.setQuestionOrder(3);
            javaQuestions.add(q3);

            Question q4 = new Question();
            q4.setQuiz(savedJavaQuiz);
            q4.setQuestionText("Which collection class in Java is thread-safe and synchronized by default?");
            q4.setOptionA("ArrayList");
            q4.setOptionB("Vector");
            q4.setOptionC("LinkedList");
            q4.setOptionD("HashSet");
            q4.setCorrectAnswer(Question.CorrectOption.B);
            q4.setMarks(2);
            q4.setExplanation("Vector is synchronized and thread-safe, whereas ArrayList is unsynchronized.");
            q4.setQuestionOrder(4);
            javaQuestions.add(q4);

            Question q5 = new Question();
            q5.setQuiz(savedJavaQuiz);
            q5.setQuestionText("Can an abstract class in Java have constructors?");
            q5.setOptionA("Yes, abstract classes can have constructors invoked via super()");
            q5.setOptionB("No, because abstract classes cannot be instantiated");
            q5.setOptionC("Only if all methods are concrete");
            q5.setOptionD("Only private constructors are allowed");
            q5.setCorrectAnswer(Question.CorrectOption.A);
            q5.setMarks(2);
            q5.setExplanation("Abstract classes can define constructors to initialize their state when a subclass instance is instantiated.");
            q5.setQuestionOrder(5);
            javaQuestions.add(q5);

            questionRepository.saveAll(javaQuestions);

            // Quiz 2: Web Development
            Quiz webQuiz = new Quiz();
            webQuiz.setTitle("Modern Web Development & React");
            webQuiz.setDescription("Challenge your understanding of JavaScript ES6+, React Hooks, and client-server REST communication.");
            webQuiz.setCategory(webCat);
            webQuiz.setDifficulty(Quiz.Difficulty.EASY);
            webQuiz.setCreator(savedDemo);
            webQuiz.setDurationMinutes(10);
            webQuiz.setTotalMarks(10);
            webQuiz.setPassingMarks(6);
            webQuiz.setNegativeMarkingEnabled(true);
            webQuiz.setNegativeMarksPerWrong(new BigDecimal("0.50"));
            webQuiz.setQuestionCount(5);
            webQuiz.setStatus(Quiz.QuizStatus.PUBLISHED);
            Quiz savedWebQuiz = quizRepository.save(webQuiz);

            List<Question> webQuestions = new ArrayList<>();

            Question w1 = new Question();
            w1.setQuiz(savedWebQuiz);
            w1.setQuestionText("Which React hook is used to perform side effects such as data fetching or subscriptions?");
            w1.setOptionA("useState");
            w1.setOptionB("useEffect");
            w1.setOptionC("useContext");
            w1.setOptionD("useMemo");
            w1.setCorrectAnswer(Question.CorrectOption.B);
            w1.setMarks(2);
            w1.setExplanation("useEffect is designed for handling lifecycle side effects in React function components.");
            w1.setQuestionOrder(1);
            webQuestions.add(w1);

            Question w2 = new Question();
            w2.setQuiz(savedWebQuiz);
            w2.setQuestionText("What HTTP status code represents '201 Created' in a RESTful API?");
            w2.setOptionA("200");
            w2.setOptionB("201");
            w2.setOptionC("204");
            w2.setOptionD("301");
            w2.setCorrectAnswer(Question.CorrectOption.B);
            w2.setMarks(2);
            w2.setExplanation("HTTP status 201 Created indicates that the request has succeeded and led to the creation of a resource.");
            w2.setQuestionOrder(2);
            webQuestions.add(w2);

            Question w3 = new Question();
            w3.setQuiz(savedWebQuiz);
            w3.setQuestionText("In modern JavaScript, what does '===' check compared to '=='?");
            w3.setOptionA("Only value equality");
            w3.setOptionB("Both value and data type equality without coercion");
            w3.setOptionC("Only memory address reference");
            w3.setOptionD("String casing equality");
            w3.setCorrectAnswer(Question.CorrectOption.B);
            w3.setMarks(2);
            w3.setExplanation("The strict equality operator (===) checks both value and data type without performing implicit type coercion.");
            w3.setQuestionOrder(3);
            webQuestions.add(w3);

            Question w4 = new Question();
            w4.setQuiz(savedWebQuiz);
            w4.setQuestionText("What does CORS stand for in web browsers?");
            w4.setOptionA("Cross-Origin Resource Sharing");
            w4.setOptionB("Client-Oriented Rendering Server");
            w4.setOptionC("Controlled Object Routing System");
            w4.setOptionD("Cross-Online Request Stream");
            w4.setCorrectAnswer(Question.CorrectOption.A);
            w4.setMarks(2);
            w4.setExplanation("CORS stands for Cross-Origin Resource Sharing, a browser mechanism allowing restricted resources to be requested from another domain.");
            w4.setQuestionOrder(4);
            webQuestions.add(w4);

            Question w5 = new Question();
            w5.setQuiz(savedWebQuiz);
            w5.setQuestionText("Which header is standardly used to transmit a JWT Bearer token in HTTP requests?");
            w5.setOptionA("Content-Type");
            w5.setOptionB("Authorization");
            w5.setOptionC("User-Agent");
            w5.setOptionD("Accept-Encoding");
            w5.setCorrectAnswer(Question.CorrectOption.B);
            w5.setMarks(2);
            w5.setExplanation("The Authorization header with 'Bearer <token>' is standard for JWT authentication.");
            w5.setQuestionOrder(5);
            webQuestions.add(w5);

            questionRepository.saveAll(webQuestions);
        }
    }
}
