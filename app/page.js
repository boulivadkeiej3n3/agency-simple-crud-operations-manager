"use client";

import { Plus, Search, SlidersHorizontal, ListTodo } from "lucide-react";
import { useState, useEffect,useRef,useReducer, createContext} from "react";
import HelperFunctions from "./_Components/helper.js";

// import CRUDForm from "./_Components/TaskForm.jsx";
import TaskFormComponent from "./_Components/TaskForm.jsx"
import TaskComponent     from "./_Components/TaskComponent.jsx"
const {alterTaskDefinition,deleteTaskDefinition, taskID:_taskID,throwUINotification,fetchDBTasks} =  HelperFunctions;
let [currentTaskCount,setCurrentTaskCount]  =[null,null] 
// let [/**TaskPool **/, reRenderTaskPool] =[,null]
let [CRUDFormVisibility, setCRUDFormVisibility ]  =[null,null]
let [CRUDFormStatus, setCRUDFormStatus]    =[null,null]
let [DashboardStatus, setDashboardStatus]  =[null, null];
let TaskPool;
// const sessionStorage = window.sessionStorage
export let HomepageContext = 22;
export let currentEditedTaskID;
{

  function __openCRUDTaskForm(_status=true){
  }

  function CRUDTask(_taskId,_operationCode){
    /** Possible Opcodes:
      1-"delete"
      2-"create"
      3-"modify"
    **/
   //ERROR HANDLING:
    _operationCode =_operationCode.replaceAll(" ","");
    const _opCodes = "delete,create,modify"
   if (!_opCodes.match(_operationCode)) throw new Error(`[TASK CRUD ERROR] '_operationCode' Passed is invalid`)
   if(_operationCode!="delete"){
    //Open the editing page
   }else{

   } 

  }


}


/****************** COMPONENTS ***********/
function EmptyListComponent(){
      return 
            <div className="flex h-full min-h-[280px] items-center justify-center">
             <div className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-400/10 bg-amber-400/[0.04]">
                  <ListTodo className="h-6 w-6 text-amber-400/50" />
                </div>

                <h3 className="text-sm font-medium text-zinc-400">
                  No tasks yet
                </h3>

                <p className="mt-1 text-xs text-zinc-600">
                  Your Task Components will appear here.
                </p>
              </div>
            </div>

}

function onTaskComponentChange({target}) {
   const targetInfo = {
    TASK_ID: target.closest(`li[name="task-component"]`).getAttribute("value"),
    actionType:target.getAttribute("name")
  }

    if(target.tagName.toLowerCase()=="select"){
      console.log("Works")
         //Disable the select button:
         target.toggleAttribute("disabled", true);
         target.classList.toggle("task-status-select__disabled", true)
         alterTaskDefinition(targetInfo.TASK_ID, {taskStatus:target.closest("select").value}).then(({status})=>{
           //throwUINotification()
          throwUINotification(`The Task Status Has Been Succesfully Changed to "${target.value}" in the Database`, "success");
                   //E the select button:


     }).catch(e=>{
      throwUINotification(`There Was A problem Changing the Task Status to "${target.value}" in the Database`, "error");

     }).finally(_=>{
      //Enable the button back
         target.toggleAttribute("disabled", false);
         target.classList.toggle("task-status-select__disabled",false);
     });
      
    } 
}
function onTaskComponentClicked({target}){
  const targetInfo = {
    TASK_ID: target.closest(`li[name="task-component"]`).getAttribute("value"),
    actionType:target.getAttribute("name")
  }
  console.log(target,"\n",targetInfo.TASK_ID,"\n",targetInfo.actionType,"\n",target.value)
  switch(targetInfo.actionType){
   case "taskEdit":
    //Show the TaskForm Component and give it the TaskID.
    currentEditedTaskID.current = targetInfo.TASK_ID;
    setCRUDFormVisibility({status:true,TASK_ID:targetInfo.TASK_ID});
 
    break;
   case "taskDelete":
    // Delete item using IMPORTED deleteTaskDefinition()
    //[1]- Apply UI Effects:
     {
       target.closest(`li[name="task-component"]`).classList.toggle("under-deletion",true);
       
     }
    //[2]- Delete it from the Database then the local storage: 
    deleteTaskDefinition(targetInfo.TASK_ID).then(({status})=>{
      console.log(status)
      setCurrentTaskCount(currentTaskCount-1);
      throwUINotification("The Task Has Been Succesfully Deleted from the Database", "success");
      //throwUINotification()
    }).catch(e=>{
      console.error(e);
      //[3]- Apply UI Effects (After Deletion fails):
       {
        target.classList.toggle("under-deletion",false);
        
        }
     throwUINotification("There was a Problem deleting the Task from the Database:( Try Again Later", "error")
    })

    break;
   case "taskStatus":
 
    //Delete the Task from the UI:

    break;
  }

}

/**
 *  FIRST, DATABASE SAVE:
 *  - DELETE FROM LOCAL STORAGE, ACTIVATE UI EFFECTS, DELETE IT FROM DATABASE.
 *  - throwUINotification() alerts
 * 
 * 
 *  SECOND WE HAVE THE 'SYSTEM LOGS PAGE'
 *   - UI NOTIFICATIONS COMPONENT WITH throwUINotification Message Activated
 *   - SYSTEM LOGS PAGE COMPONENT 
 *   - SINGLE MESSAGE COMPONENT 
 * THIRD WE HAVE THE 'CONTACT TEAM PAGE'
 *   - CONTACT TEAM CHAT PAGE
 * 
 * 
 * */
function TaskListParent(){

      return (
       <ul className="bg-red" onClick={onTaskComponentClicked} onChange={onTaskComponentChange}>
        {TaskPool.map((TaskInfoTable,index)=><TaskComponent key={TaskInfoTable.TASK_ID} TaskInfo={TaskInfoTable}  />)}
       </ul>);

 }
function updateTaskPool(newTaskPool=TaskPool){
  //Clear the sessionStorage then put the newly fetched data
  window.sessionStorage.clear();
  Object.values(newTaskPool).map(TaskDefinition=>{
   window.sessionStorage.setItem(TaskDefinition.TASK_ID,JSON.stringify(TaskDefinition));
  })
}
/***************************************/
export default function Dashboard() {
      HomepageContext = createContext();
      TaskPool        = ((new Array(window.sessionStorage.length).fill("")).map((_,_index)=>JSON.parse(window.sessionStorage.getItem((window.sessionStorage.key(_index)) ))) );
      console.log("From Dashboard" , TaskPool);
   // [/**TaskPool **/, reRenderTaskPool]          = useReducer((_placeholder)=>{console.log(_placeholder," This useReducer is CALLED"); return _placeholder+1}, 0);
   // TaskPool                                     = useRef([]);
   [CRUDFormVisibility, setCRUDFormVisibility ] = useState({status:false,TASK_ID:false});
   [CRUDFormStatus, setCRUDFormStatus]          = useState("normal");
   [DashboardStatus, setDashboardStatus]        = useState("outdated");
   /**
    *  Possible Dashboard Status:
    *  1- "outdated",
    *  2- "loading"
    *  3- "updated"
    *  4- "fetch-error"
    * 
    * */
      /*
    CRUDFormVisibility OPTIONS:
    1- normal
    2- loading
    3- error
   */
         [currentTaskCount,setCurrentTaskCount]    = useState(TaskPool.length);
         currentEditedTaskID                        = useRef(null);
   const [_,updateLocalDBFromSupabase]  = useReducer((x)=>{
    console.log("asdsad")
      //[1]- BEFORE UPDATE UI-EFFECTS:
        setDashboardStatus("loading");
       fetchDBTasks().then(OnlineData=>{
            TaskPool = OnlineData;
            updateTaskPool();
            console.log("Fetchis called",OnlineData)
        //[3.1]- After UPDATE UI -EFFECTS (SUCCESS)
        setDashboardStatus("updated");
        throwUINotification("Local Databsae Updated Succesfully", "success")

       }).catch(e=>{
        throwUINotification("Failed to Fetch Data and Update Local Databse :( Please Refresh Again,", "error")
        //[3.2]- After UPDATE UI -EFFECTS (ERROR)
        setDashboardStatus("loading");
      })
    })
  


 const ComponentStates ={CRUDFormStatus, setCRUDFormStatus, CRUDFormVisibility,setCRUDFormVisibility};
  // console.log(HomepageContext,ComponentStates)
/******* INITIAL ************/

 useEffect(()=>{
  if("outdated,fetch-error".match(DashboardStatus)){
    console.log("Dashboard is Updating...")
    updateLocalDBFromSupabase(12)
  } 
 },[DashboardStatus])
/****************************/
 

  return (
    <main className="min-h-[calc(100vh-80px)] bg-[#08090d] text-white">
    <HomepageContext.Provider value={ComponentStates}>
            <TaskFormComponent/>
    </HomepageContext.Provider>

      <div className="mx-auto flex w-full max-w-7xl flex-col px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

        {/* Dashboard Header */}
        <div className="mb-6 flex flex-col gap-5 sm:mb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.25em] text-amber-400/70">
              <ListTodo className="h-4 w-4" />
              Task Management
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl lg:text-4xl">
              Dashboard
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-500 sm:text-base">
              Manage, monitor, and organize your tasks from one place.
            </p>
          </div>

          {/* Add Task Button */}
          <button
            id="dashboard__create-task-button"
            type="button"
            className="group flex w-full items-center justify-center gap-2 rounded-xl border border-amber-400/30 bg-gradient-to-r from-amber-500 to-yellow-600 px-5 py-3 text-sm font-semibold text-black shadow-lg shadow-amber-950/30 transition-all duration-200 hover:from-amber-400 hover:to-yellow-500 hover:shadow-amber-500/10 active:scale-[0.98] sm:w-auto "
            onClick={()=>{setCRUDFormVisibility({status:true,TASK_ID:null}) }}
          >
          {/**
               When react uses the == to euqalize the two and decide if it's actually changed. It evaluates to the pointer of the object
               since the pointer is the same. Nothing is changed :)
               using Object.assign() still returns the pointer not a new object, hence it doesn't change anything


          */}
            <Plus className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90" />
            Add Task
          </button>
        </div>

        {/* Toolbar */}
        <div className="mb-4 flex flex-col gap-3 sm:mb-5 md:flex-row">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />

            <input
              type="text"
              placeholder="Search tasks..."
              className="h-12 w-full rounded-xl border border-white/[0.07] bg-white/[0.025] pl-11 pr-4 text-sm text-zinc-200 outline-none transition-all placeholder:text-zinc-600 focus:border-amber-400/30 focus:bg-white/[0.04] focus:ring-1 focus:ring-amber-400/10"
            />
          </div>

          {/* Filter */}
          <button
            type="button"
            className="flex h-12 items-center justify-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] px-5 text-sm font-medium text-zinc-400 transition-all hover:border-amber-400/20 hover:bg-amber-400/[0.04] hover:text-amber-300"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filter</span>
          </button>
        </div>

        {/* Task List Container */}
        <section className="overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-b from-white/[0.035] to-white/[0.015] shadow-2xl shadow-black/20">

          {/* List Header */}
          <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-4 sm:px-5 lg:px-6">
            <div>
              <h2 className="text-sm font-semibold text-zinc-200 sm:text-base">
                {(!TaskPool.length)?"No Tasks Yet":`${TaskPool.length} Tasks`}
              </h2>

              <p className="mt-1 text-xs text-zinc-600">
                Your current task list
              </p>
            </div>

            <span name="taskCount"className="rounded-full border border-amber-400/10 bg-amber-400/5 px-3 py-1 text-xs font-medium text-amber-400/70">
                {(!TaskPool.length)?"No Tasks Yet":`${TaskPool.length} Tasks`}
            </span>
          </div>

          {/* Scrollable Task Area */}
          <div
            className="
              h-[55vh]
              min-h-[320px]
              max-h-[700px]
              overflow-y-auto
              overscroll-contain
              p-3
              sm:h-[60vh]
              sm:p-4
              lg:h-[65vh]
            "
          >
            {/* Task Components will be rendered here later */}

             {(!TaskPool?.length)?<EmptyListComponent/>:  <TaskListParent/> }
          </div>
        </section>
      </div>
    </main>
  );
}

 