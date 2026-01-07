Project Overview
I built this application as part of the Codetikki engineering assessment to demonstrate a solid grasp of React fundamentals. It’s a simple but robust notes manager that allows users to create and delete notes with a focus on a smooth user experience.


Technical Decisions & Architecture
Instead of dumping all the logic into one file, I broke the UI into five distinct components to keep the codebase clean and maintainable:


NoteForm: Handles all user input and includes logic to prevent empty titles from being submitted.


NoteList & NoteItem: Separates the logic of mapping through the data from the actual rendering of individual notes.

Feedback Components: I created standalone Loader and EmptyState components to ensure the UI remains helpful to the user at every stage of the lifecycle.


State Management
I chose to manage state in the App.jsx component—the lowest common ancestor—to ensure a predictable "one-way" data flow:


Data Flow: Notes are stored in an array and passed down to the list via props.


Simulated Delay: I used a useEffect hook with a setTimeout to simulate the 1.5-second loading period required in the mission parameters.


Validation: Form validation is handled internally within the NoteForm, updating the UI instantly if the title field is touched but left empty.


How to Run Locally
Clone the repository.

Run npm install to grab the dependencies.

Run npm run dev to start the local development server.

Open your browser to the port shown in your terminal (usually http://localhost:5173).

Assumptions
I assumed that note descriptions are optional, while titles are strictly required for a submission to be valid.

I prioritized code clarity and component separation over complex CSS frameworks to meet the specific "No Overengineering" parameter of the mission.