
import {
  Pencil,
  Trash2,
  CalendarDays,
  Clock3,
} from "lucide-react";


function TaskDropDownMenu({status}){
  console.log(status)
  return (
    <div className="self-center">
      <div className="relative">
        <select
          id="task-status"
          name="TASK_STATUS"
          defaultValue={status}
          className="
            w-full appearance-none rounded-xl
            border border-gray-200 bg-white
            px-4 py-3 pr-10
            text-sm font-medium text-gray-800
            shadow-sm outline-none
            transition-all duration-200
            hover:border-gray-300
            focus:border-blue-500
            focus:ring-4 focus:ring-blue-500/10
          "
        >
          <option value="Completed">
            ✓ &nbsp; Completed
          </option>

          <option value="Ongoing">
            ◉ &nbsp; Ongoing
          </option>

          <option value="Paused">
            ⏸ &nbsp; Paused
          </option>
        </select>

        {/* Dropdown arrow */}
        <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
          <svg
            className="h-4 w-4 text-gray-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
    </div>
    );
}
export default function TodoTaskCard({TaskInfo}) {
  console.log("TaskInfo: ", TaskInfo)
 /*
   TaskInfo={
    TASK_NAME:        TASK_NAME
    TASK_DESCRIPTION: TASK_DESCRIPTIPON_STRING
    DUE_DATE:         DUE_DATE_OBJECT
    BEGIN_DATE:       BEGINNING_DATE_OBJECT
    TASK_PRIORITY:    TASK_PRIORITY_INTEGER
    TASK_STATUS:      TASK_STATUS_DROPDOWN_MENU_SELECITON
   }
 */
  return (
    <li key={TaskInfo.TASK_ID} value={TaskInfo.TASK_ID}  name="task-component" className=" cursor-pointer w-full rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg sm:p-6">

      {/* Top Section */}
      <div className="flex items-start justify-between gap-4">

        {/* Task Name */}
        <h2 name="TASK_NAME" className="min-w-0 flex-1 text-xl font-bold tracking-tight text-gray-900 sm:text-2xl lg:text-3xl">
          {TaskInfo["TASK_NAME"]}
        </h2>

        {/* Action Buttons */}
        <div className="flex shrink-0 items-center gap-2">

          {/* Edit Button */}
          <button
            type="button"
            aria-label="Edit task"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-500 transition-all duration-200 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 active:scale-95 sm:h-10 sm:w-10"
            name="taskEdit"
          >
            <Pencil name="taskEdit" className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>

          {/* Delete Button */}
          <button
            type="button"
            aria-label="Delete task"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-500 transition-all duration-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600 active:scale-95 sm:h-10 sm:w-10"
            name="taskDelete"

          >
            <Trash2 name="taskDelete" className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>

        </div>
      </div>



      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-1">
   
              {/* Dates */}
      <div className="flex flex-row justify-between flex-wrap">
           {/* Description */}
        <div>
         <p name="TASK_DESCRIPTION" className="h-30 line-clamp-3 text-sm leading-6 text-gray-500 sm:text-base">
          {TaskInfo["TASK_DESCRIPTION"]}
         </p>
          <TaskDropDownMenu status={TaskInfo.TASK_STATUS}/>
        </div>
        <div className="flex flex-col justify-end">
        {/* Beginning Date */}
        <div className="flex items-end gap-3 rounded-xl bg-gray-50 p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
            <CalendarDays className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-medium text-gray-400">
             Begin Date
            </p>

            <p className="truncate text-sm font-semibold text-gray-700">
             {TaskInfo["BEGIN_DATE"]}

            </p>
          </div>
        </div>

        {/* Due Date */}
        <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
            <Clock3 className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-medium text-gray-400">
              Due Date
            </p>

            <p className="truncate text-sm font-semibold text-gray-700">
              {TaskInfo["DUE_DATE"]}

            </p>
          </div>

         </div>
        </div>
        

       </div>


      </div>
    </li>
  );
}



   