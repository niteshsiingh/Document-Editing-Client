# Document-Editing-CLient

Document-Editing-Client is a collaborative document editing application that mimics the functionality of Google Docs. It allows multiple users to edit documents in real-time, with changes being synchronized across all users.

# Document-Editing-Client

Document-Editing-Client is a collaborative document editing application that mimics the functionality of Google Docs. It allows multiple users to edit documents in real-time, with changes being synchronized across all users.

## Features

- **Real-time Collaborative Editing**
  - Seamless collaboration powered by CRDTs to prevent merge conflicts.
- **Rich Text Formatting**
  - Font family selection
  - Font size adjustment
  - Text color customization
  - Bold, italic, and underline styling
- **Table Handling**
  - Table insertion
  - Add rows and columns when the table is selected
  - *Note*: Text functionality within tables is currently limited.
- **Image Handling**
  - Insert, resize, and delete images within the document.
  - However the images are not persistent now.
- **User Authentication and Authorization**
  - Secure login and document access control.
- **Document Version History**
  - Track changes and revert to previous versions.
- **Responsive Design**
  - Optimized for both mobile and desktop platforms.

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

## Usage Instructions

After setting up the application, follow these steps to start using it.

### 1. Register an Account

- Open your web browser and navigate to `http://localhost:3000`.
- Click on the **Sign Up** button.
- Fill in the registration form with your username, email, and password.
- Submit the form to create your account.

### 2. Log In

- After registration, you will be redirected to the **Log In** page.
- Enter your credentials and click **Log In**.

### 3. Dashboard

- Once logged in, you'll see your dashboard.
- Here you can:
  - **Create New Documents**: Click on **New Document** to start a new document.
  - **Access Existing Documents**: Your saved documents are listed and can be opened by clicking on them.

### 4. Editing Documents

In the editor, you can:

#### Rich Text Formatting

- **Font Family Selection**: Choose different fonts from the dropdown menu.
- **Font Size Adjustment**: Select the desired font size.
- **Text Color Customization**: Pick a text color from the color palette.
- **Bold, Italic, Underline**: Use the formatting buttons to style your text.

#### Table Handling

- **Insert Tables**: Click on the **Insert Table** button to insert a table.
- **Modify Tables**: Add rows and columns to your table when it is selected.
- *Note*: Text functionality within tables is currently limited. If you are using tables then then document will now save because the editing part of table is not working.
- *Note*: If you have created a table and you are unable to delete text or the text is not persistent, create a new document and test other features in that. This issue is due to table mishandling, which is a future work item.

#### Image Handling

- **Insert Images**:
  - Click on the **Insert Image** button.
  - Enter the image URL or upload an image from your device.
- **Resize Images**:
  - Click and drag the corners of the image to resize.
- **Delete Images**:
  - Click on the **Delete** button (an `X` icon) at the top-right corner of the image (which doesn't seems to be working properly).
- *Note*: If you have uploaded an image and you are unable to delete text or the image or the text is not persistent, create a new document and test other features in that. This issue is due to image deletion mishandling, which is a future work item.

#### Real-time Collaboration

- **Collaborate with Others**:
  - Share the document URL with collaborators.
  - Edits made by any user are synced in real-time for all collaborators.

### 5. Saving and Version History

- **Auto-Save**: All changes are automatically saved.
- **Version History**:
  - Access previous versions of your document.
  - Restore to an earlier version if needed.

### 6. Log Out

- Click on your profile icon or the **Log Out** button to end your session.



## Contact

For any questions or suggestions, please open an issue or contact the maintainer at [nitesh28iitdmaths@gmail.com].