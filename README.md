# Bank-System

A simple RESTful API-based bank system for managing loans, payments, and customer accounts. This project is designed for educational and demonstration purposes, focusing on core banking functionalities such as lending, loan repayment, transaction ledgers, and account overviews.

---

## Project Description

Bank-System allows banks to issue loans to customers, track repayments (EMI or lump sum), maintain transaction ledgers for each loan, and provide customers with an overview of their accounts and outstanding loans. The system is built to be simple and transparent, with the flexibility to use any database or file-based system for persistence. It is not intended for production use but is a solid foundation for learning about financial application design.

---

## Features

- **LEND**: Issue loans to customers with any amount and any number of loans per customer.
  - Calculates total amount to be paid and monthly EMI.
  - Input: customer_id, loan_amount (Principal), loan_period (years), rate of interest.
  - Output: Total amount to be paid, monthly EMI.
- **PAYMENT**: Accept loan repayments as EMIs or lump sum payments.
  - Lump sum payments directly reduce the outstanding balance and number of EMIs.
- **LEDGER**: View all transactions for a specific loan.
  - Returns transaction history, balance, EMI amount, and remaining EMIs.
- **ACCOUNT OVERVIEW**: Lists all loans taken by a customer.
  - Displays loan amount, total payable, EMI, total interest, paid amount, and EMIs left.

---

## Calculations

- **Interest (I):**  
  `I = P (Principal) * N (No of Years) * R (Rate of Interest)`

- **Total Amount (A):**  
  `A = P + I`

- **EMI Calculation:**  
  `Monthly EMI = A / (N * 12)`

---

## Assumptions

- There are no restrictions on the loan amount or the number of loans per customer.
- Lump sum payments immediately reduce the outstanding balance.
- The system is designed for simplicity and demonstration, not for production use.
- Any programming language, framework, and data persistence method can be used.

---

## Technologies Used

- **Programming Language:** (e.g., Python, JavaScript, Java, etc.)
- **Framework:** (e.g., Flask, Express.js, Spring Boot, etc.)
- **Database:** (e.g., SQLite, MongoDB, file-based storage, etc.)
- **API Protocol:** RESTful APIs

*Please update these sections to reflect your chosen tech stack.*

---

## Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Knaveen007/Bank-System.git
   cd Bank-System
   ```

2. **Install dependencies:**
   - Refer to your selected framework and language documentation.
   - Example for Python/Flask:
     ```bash
     pip install -r requirements.txt
     ```

3. **Configure the database:**
   - Follow instructions in the codebase or documentation.

4. **Run the application:**
   - Example for Python/Flask:
     ```bash
     python app.py
     ```
   - The server will start and RESTful endpoints will be available.

5. **API Documentation:**
   - See [`docs/API.md`](docs/API.md) for endpoint details.

---

## Usage

- Use REST clients like Postman, Insomnia, or `curl` to interact with the APIs.
- **LEND Loan:**  
  `POST /loans` with customer ID, principal, rate, and period.
- **Make PAYMENT:**  
  `POST /loans/{loan_id}/payment` with EMI or lump sum.
- **View LEDGER:**  
  `GET /loans/{loan_id}/ledger`
- **Account Overview:**  
  `GET /customers/{customer_id}/overview`

See [API Documentation](docs/API.md) for request/response formats.

---

## Contribution Guidelines

1. **Fork the repository**
2. **Create a new branch:**  
   `git checkout -b feature-name`
3. **Commit your changes**
4. **Push to your branch:**  
   `git push origin feature-name`
5. **Open a pull request**

Feel free to submit issues or suggestions for improvements!

---

## License

This project is licensed under the MIT License.

---

## Design Decisions

- **RESTful API** for simplicity and ease of integration.
- **Flexible persistence** layer: database or files.
- **Simple calculations** as per standard banking norms.
- **Modular design** for easy expansion and testing.

---

## Contact

For questions or support, open an issue in the repository or reach out via GitHub.
