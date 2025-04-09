# Order Management System – Frontend (Angular)

## Project Overview
The **Order Management System** frontend is built using **Angular** and provides a user-friendly interface for managing orders. It interacts with the backend API to facilitate user authentication, order creation, and order tracking. The application utilizes **Angular Material** for a modern and responsive design.

## Table of Contents
- [Installation Instructions](#installation-instructions)
- [Usage](#usage)
- [File Structure Overview](#file-structure-overview)
- [Environment Variables](#environment-variables)
- [Angular Material](#angular-material)
- [Future Improvements](#future-improvements)
- [License](#license)

## Installation Instructions

To set up the project locally, follow these steps:

1. **Clone the Repository**
   ```bash
   git clone https://github.com/[username]/PillwayBackend.git
   cd PillwayBackend/frontend
   ```

2. **Install Dependencies**
   Make sure you have **Node.js** and **npm** installed. Then, run the following command to install all required dependencies:
   ```bash
   npm install
   ```

3. **Run the Development Server**
   Start the Angular development server with the following command:
   ```bash
   ng serve
   ```
   The application will be available at `http://localhost:4200`.

   Once the server is running, you can access the application in your web browser.

## File Structure Overview

Here’s a brief overview of the file structure and the purpose of each file:

### 📁 src/
Main source folder for the Angular application.

### 📁 app/
Contains the core application code, components, services, and routing configuration.


#### 📁 auth/
Handles user authentication logic.

- 📁 login/: Login form component and logic.
- 📁 register/: Registration form component and logic.

#### 📁 guards/
Route guards to control access based on authentication.

- `auth.guard.ts`: Ensures routes are accessible only to authenticated users.
- `no-auth.guard.ts`: Prevents access to routes if the user is already authenticated.


#### 📁 models/
Holds TypeScript interfaces and models.

- `item.model.ts`: Defines the structure of item data.


#### 📁 services/
Provides shared logic and services across components.

- `auth.service.ts`: Manages user authentication and token handling.
- `cart.service.ts`: Manages shopping cart functionalities.
- `items.service.ts`: Handles item-related API calls.
- `order.service.ts`: Manages order-related operations.


#### 📁 user/
User-facing components and modules.

- 📁 dashboard/: Displays user dashboard and summary info. (For both user : customer and admin)
- 📁 items/: Displays items available for purchase or management.
- 📁 orders/: Handles order-related UI.
- 📁 payment-modal/: Modal component for payment process.

- `user.module.ts`: Main module for user-related features.
- `user-routing.module.ts`: Routing configuration for user module.
- `app.component.ts|html|scss`: Root component of the application.
- `app.config.ts`: Configuration for shared constants and settings.
- `app.routes.ts`: Application-wide routing.

### 📁 environments/
Environment-specific configuration.

- `environment.ts`: Development environment variables.

### 📁 public/
Public assets for the application.


### 📄 index.html
HTML entry point of the application.

### 📄 main.ts
Main bootstrap file for Angular app.

### 📄 styles.scss
Global styles for the Angular application.

### ⚙️ Configuration Files

- `.editorconfig`: Code style configuration.
- `.gitignore`: Specifies intentionally untracked files to ignore.
- `angular.json`: Angular CLI configuration.
- `package.json`: Lists project dependencies and scripts.
- `tsconfig.*.json`: TypeScript configuration files.

### 🧪 tests/
Contains unit and integration tests.

- `.spec.ts` files are used for testing components and services.

---

## Environment Variables

Set up environment variables in `src/environments/environment.ts`. This file contains configuration settings for development environment. For example:

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  baseUrl: 'http://localhost:8000/api', // Update this to your API base URL
};
```

## Angular Material

This project utilizes **Angular Material** to provide a modern UI component library. Ensure that you have installed Angular Material by running:

```bash
ng add @angular/material
```

Follow the prompts to set up Angular Material in your project.

## Future Improvements

- Implement user profile management features.
- Add payment integration for online transactions (Currently Mock).
- Research and improve accessibility features for better user experience.

## License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
