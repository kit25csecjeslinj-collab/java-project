# BloodLink AI - Complete Java 17 + Spring Boot 3 + MySQL Backend

This directory contains the complete Java Spring Boot backend source code for the **AI-Powered Blood Bank & Donor Management System**.

## Stack
- **Language:** Java 17 (or Java 21 LTS)
- **Framework:** Spring Boot 3.2.4
- **Persistence:** Spring Data JPA + Hibernate
- **Database:** MySQL 8.0+
- **Security:** Spring Security 6 with BCrypt Password Hashing & Role-Based Access Control (Admin, Staff, Donor)
- **Validation:** Jakarta Bean Validation (Hibernate Validator)
- **Views:** Thymeleaf + Bootstrap 5 + Chart.js
- **Build Tool:** Apache Maven

## Eclipse IDE Import Steps
1. Open Eclipse IDE for Enterprise Java.
2. Go to **File -> Import... -> Maven -> Existing Maven Projects**.
3. Choose this directory (`/backend-spring-boot`) as the root.
4. Eclipse will automatically recognize `pom.xml` and download dependencies.
5. Setup your local MySQL database using `src/main/resources/schema.sql`.
6. Copy `src/main/resources/application.properties.example` to `application.properties` and input your MySQL credentials.
7. Run `com.bloodbank.BloodBankApplication` as a Spring Boot App.
8. Access at `http://localhost:8080`.
