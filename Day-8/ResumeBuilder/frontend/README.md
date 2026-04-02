# AI Resume Builder - Frontend

This is the React client for the AI Resume Builder. It connects to the Express/Socket.IO backend to handle authentication, manage previous chat sessions, and provide a live preview of the generated resume.

## 🚀 Features
- **Sidebar Integration**: Navigate multiple past resume building sessions seamlessly.
- **Live Markdown Chat**: An interactive chat area utilizing Markdown rendering.
- **Dynamic Preview**: Receives structured JSON from the server and instantly previews what the final resume will look like.
- **Responsive Layout**: Designed for mobility and fluid desktop interactions.

## 🛠️ Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Ensure your `.env` or configuration points to your backend URL:
   ```text
   VITE_API_BASE_URL=http://localhost:5008
   ```

3. **Run the Development Server**
   ```bash
   npm run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   ```
