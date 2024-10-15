# Document-Editing-CLient

Document-Editing-CLient is a collaborative document editing application that mimics the functionality of Google Docs. It allows multiple users to edit documents in real-time, with changes being synchronized across all users.

## Features

- Real-time collaborative editing
- Rich text formatting
- User authentication and authorization
- Document version history
- Responsive design for mobile and desktop

## Technologies Used

- **Frontend**: React, Redux, TypeScript, Tailwind CSS
- **Real-time Communication**: WebSockets
- **Authentication**: JWT

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/niteshsiingh/Document-Editing-Client.git
   cd Document-Editing-Client
   ```
2. Install dependencies for the frontend
    cd client
    npm install

3. Start the development Server
    npm run dev

4. Open your browser and navigate to `http://localhost:3000`

## Acknowledgements

The initial frontend repository is based on [Noah's Google Docs Clone](https://github.com/noahskorner/google-docs-clone). I have modified the necessary files to meet my requirements, such as removing WebSockets for sharing documents and instead using CRDTs. Thank you, @noahskorner , for the great starting point!

## Contact

For any questions or suggestions, please open an issue or contact the maintainer at [nitesh28iitdmaths@gmail.com].
