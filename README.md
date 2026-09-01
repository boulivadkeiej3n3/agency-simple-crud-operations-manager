
﻿

# Agency Simple CRUD Operations Manager (NO LOGIN)



# Overview

This is a simple Web app with *clear, responsive, and semantic UI* that allow an Agency's staff to manage their operations by ***Creating, Reading, Deleting, and Updating*** organized blocks (e.g. Tasks) to improve workflow and ease communication between coworkers. The web app works by saving all these  "blocks" (Tasks) to a *temporary local web storage* - to improve code efficiency reading and writing data - as well as a **Remote Supabase Database**
 **

## NO AI WAS USED IN THIS WORK OTHER THAN THE BACKEND FILES AND THE UI DESIGN JSX COMPONENT FILES

**
# Project File Structure
 
## Client Side
**app/page.js** Main Homepage (Dashboard) Component JSX file that appears when directed to the URL "/". This page display all *Tasks* with UI tools that allow you to do all *CRUD* operations on the Task, Filter& Search certain *Tasks* .
**app/history.js** History Page Component that shows all saved CRUD operations done at any point of the software. These include all CRUD operations done by all team members that the *Backend* allows access to. CRUD operations history is fetched from the main *Supabase Database History Table* 
 **app/system-logs.js**  A Simple System Logs Page Component that shows all *system logs/messages (Notifications)* send by the server to the *Client* During  ONLY a single session. These *logs* are reset every session and are fetched& saved to the *Web Session Storage* 
 
 ## Backend 
 **dbconfig.js** Contains crucial data sets regarding connection to the *Supabase* database and *Edge Functions* including the apiKey, Endpoints, and other critical connection information. 
 **fetchDBTasks.ts** A Supabase Edge Function that is responsible for retrieving a specified number ("count") of tasks from the Supabase Database depending on *startIndex* and *count* parameters passed to it by a Fetch Request. If *startInex* is omitted, then it will retireve the latest number of *Tasks* that is equal to *count*
 **CRUDTasks.ts** A Supabase Edge Function that is responsible for executing CRUD operations on any *Task* inside of the Supabase Database designated table (*TARGET_TABLE*) by a Fetch Request . if *TASK_ID* is passed to it alongside other  *Task* information (Lookup ***Database Section*** below to know more about possible parameters) AND row with such "*TASK_ID*" already exists, then it will only edit the values for the columns passed to it. IF *TASK_ID* Doesn't exist in the database designated table, THEN IT WILL Create a new row with *TASK_ID* assigned to it alongside all other valid parameters passed to it.
## Database
### A Supabase-Managed PostgreSQL Database that is designed to save two types of information: [1]- All Tasks (*e.g. Units*), [2]- History of System Logs. Each is assigned a separate designated *Table* and are treated as separate Tables without any Joints.

### The Schema of each Table is as follows:
 #### 1-   All Tasks History 
**‘All Tasks Table'** represents a storage of *Tasks* that have been *created, modified, or deleted* by the Agency’s staff either through the UI or other means such as API requests. 

The Scheme of *‘All Tasks’* Table has *9 Columns* as follows:

 1. **ID**: Is an identifier to each row in the database and used later for
    fetching/updating data.
 2. **TASK_NAME**: A descriptive name that represents the mission of the
    Task CREATION_DATE: The date and time at which the server has
    received the request to create this Task
 3. **LAST_MODIFIED_AT**: The date and time at which the server has received
    a request to modify the Task. This is helpful for later on data
    collection and analysis.
 4. **BEGIN_DATE**: The date at which the creator has designated to begin
    working on this Task
 5. **DUE_DATE**: The date at which the creator has designated as a deadline
    for the Task
 6. **TASK_STATUS**: An integer represents whether the Task is
    ‘Completed(1)’, ‘Ongoing(0)’, or ‘Paused(2)’
 7. **TASK_PRIORITY**: An integer defines the Priority of the Task  to be
    completed. The higher the number the higher it appears on the UI.

 #### 2-  System Messages Logs Table:
 **'System Messages Logs Table'** contains the history of all *System Messages (Logs)* that have been initiated by the server as a response to a request/call by the *User(Initiator)*

The Scheme  of the ‘System Messages (Logs)' has *7 Columns* as follows:  
  

1.  **ID**: Is an identifier to each row in the database and used later for fetching/updating data.
2.  **SYSTEM_MESSAGE**: The original Message send back by the Server to the User(Initiator)
3.  **MESSAGE_TYPE**: A String representing the Type of the Message as either ‘error’ or ‘info’
 4.  **CREATION_DATE**: The date and time the Server has initiated this response.
5.  **INITIATOR_ID**: An identifier of the User(Initiator) that has caused the Server to respond. 
6.  **SERVER_CALLBACK**: Either ‘null/empty’ or a Function call the Server demands the Client-side code to call passing some arguments.

# Workflow (Technical) 
 ### On the Client Side:
 **[1]- On CRUD:**
 The **Initiator(User/Client)** goes to the path "/" where *page.js* loads as a *Dashbaord/Homepage*. With it a  * Fetch request is sentto the Corrospondent Edge Function *(Lookup Section **Backend** for more info)* to retrieve the required *number* of Stored Tasks from the **All Tasks Table(Database)** first. If this operation succeeded the *User* will be notified with a UI Notification Element, and if it fails, the *User* will be notified as well while seeing an *Emptry Task List*.
 
One the *Homepage* the *User* will find a list of *UI Task Components* in  a scrollable list. Once a task is picked, the user can can do an UPDATE operation to it by clicking ont the *Edit button marked with a Pencil figure* to edit all values of that *Task*. When the *Edit button* is clicked the task *key* property of the JSX Component - that was set earlier by the software - dedicate the *TASK_ID* that's currently being edited, and any modification will translate, by a Fetch request to the Corrospondent Edge Function *(Lookup Section **Backend** for more info) into a mutation of the *ROW* wth the same *TASK_ID* inside of **All Tasks Table (Remote Database)** as well as modifying the *Entry* with the same corrospondent *TASK_ID* within local *Session Storage* - merely to improve code efficiency and speed - as well. 

If a *User* decides to delete a *Task* Entirely from the *Database*, then almost  the same process apply as *Editing a Task*, except this time a Fetch request is sent that includes the *TASK_ID* of the *ROW* that wants to be deleted with a parameter `{OP_CODE: "delete"}`.  If the requested *TASK_ID* exists in the *Database* it will be deleted, otherwise it will fail and the *User* will be notified with a *UI Element*.

The *User* has the freedom for altering merely the *TASK_STATUS (e.g. "Ongoing => "Completed")* by clicking on the *Current Task Status button at the very end of the Task Component and changing the Status to their desired status* . Same process will apply as *Editing a Task* in the back scene but only for the Task Status for easier workflow.


**[2]- Viewing System Logs:**
The *User* can also view all *messages/logs* received by the server, FOR ONLY A SINGLE SESSION,  as a response to their *actions* from the by heading to the path "/system-logs". There they can view all the logs including the *literal message* sent b the server, the *message type (e.g. Warning, Error or Success)*, the *timestamp  it was recieved at*, and other useful information. 

# Technologies Used 

**Next.js (+JSX)** As the main Frontend framework and UI Components.

**Supabase - Edge Functions** As a simple approach for handling serverless requests that deal, mainly, with the database such is CRUD requests. 

**Supabase -PostgreSQL** As the main Relational Database to store all sorts of information. Managed by Supabase for convenience .

## Notes
 N/A
