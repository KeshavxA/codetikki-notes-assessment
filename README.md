Google Drive Video link
https://drive.google.com/file/d/1rAO9UoRJ1rWLHD86QD3JOVRVi39Sogrz/view?usp=sharing


Project Overview
This application was built for the React JS Notes Management Assessment  to demonstrate my ability to build clean, state-driven user interfaces. It follows the Three Pillars of development: Solid Architecture, Flawless State, and Thoughtful UX.


Technical Decisions
Component Architecture: I separated the UI into logical parts to avoid "prop drilling" and ensure maintainability. The app consists of a main Container, a NoteForm for data entry, and a NoteList that maps through NoteItem components.





State Management: As required, I used React State primitives only (Hooks) and did not use external libraries like Redux. All state is "lifted" to App.jsx, the lowest common ancestor, to ensure data flows predictably down to children.




Simulated API: I used useEffect with a setTimeout to simulate a 1.5-second loading state on initial mount, allowing the implementation of a professional Loader component.



Component Breakdown

<App />: The root container holding the main notes array and isLoading status.


<NoteForm />: Manages the inputs for Title (required) and Description (optional). It features inline validation to prevent empty submissions.



<NoteList />: Receives the notes array as props and renders the collection.





<NoteItem />: Displays the individual note data and handles the immediate delete trigger.




<Loader />: Displays a visual indicator during the initial loading period.




<EmptyState />: Displays a friendly "No notes available" message when the list is empty.


How to Run
Ensure you have Node.js installed on your machine.

Clone this repository and navigate into the folder.

Run npm install to install all dependencies.

Run npm run dev to start the Vite development server.

Assumptions & UX Handling

Validation: The "Submit" button is programmatically disabled until a title is entered to prevent invalid state updates.


Error States: Instead of using browser alerts, I implemented inline error messages below the title input for a better user experience.



Persistence: Since no backend was required, all notes are stored in memory and will reset upon a full page refresh.