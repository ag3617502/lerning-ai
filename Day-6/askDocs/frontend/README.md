# Document Chat Frontend

The front-facing UI of our application created using **React (Vite)** and heavily styled using **Tailwind CSS** to emulate a premium, ChatGPT-like interface.

## Architecture

We adopted the **Atomic Design Methodology** to ensure components are highly reusable and distinct:
*   **`Atoms`**: Fundamental UI elements (Buttons, Inputs, Spinners).
*   **`Molecules`**: Simple combinations of atoms (Form Fields, Conversation Cards).
*   **`Organisms`**: Complex, distinct sections of the UI (`Sidebar`, `UploadArea`, `ChatArea`).
*   **`Pages`**: The highest level structure coordinating organisms (`LoginPage`, `SignupPage`, `ChatPage`).

## Core Features
1. **Protected Routing**: The app gracefully restricts unauthorized access, bouncing users to the Login screen if they lack a valid JWT token.
2. **Dynamic UI States**: 
   * Provides immediate visual feedback indicating if a chat expects a document upload or is ready for messaging.
   * Real-time conversational updates rendered optimistically.
3. **Mobile-First Responsiveness**: Handled entirely through Tailwind utilities, ensuring smooth Sidebar toggling and chat scaling on small devices.
4. **Seamless API Integration**: An Axios instance is pre-configured with interceptors to automatically strap the `Authorization` bearer token to every outgoing request.
