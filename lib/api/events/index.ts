import { fetchEventHandler } from "./fetch";
import { createEventHandler } from "./create";
import { updateEventHandler } from "./update";
import { deleteEventHandler } from "./delete";

export const EventHandlers = {
  fetch: fetchEventHandler,
  create: createEventHandler,
  update: updateEventHandler,
  delete: deleteEventHandler,
};

export { fetchEventHandler, createEventHandler, updateEventHandler, deleteEventHandler };
