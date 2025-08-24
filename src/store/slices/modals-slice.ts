import { Command, CommandGroup } from "@/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "..";

interface ModalsState {
  group: {
    create: boolean;
    update: CommandGroup | null;
    delete: CommandGroup | null;
  };
  command: {
    create: boolean;
    update: Command | null;
    delete: Command | null;
  };
}

const initialState: ModalsState = {
  group: {
    create: false,
    update: null,
    delete: null,
  },
  command: {
    create: false,
    update: null,
    delete: null,
  },
};

export const modalsSlice = createSlice({
  name: "modals",
  initialState,
  reducers: {
    // Group modals
    setGroupCreate: (state, action: PayloadAction<boolean>) => {
      state.group.create = action.payload;
    },
    setGroupUpdate: (state, action: PayloadAction<CommandGroup | null>) => {
      state.group.update = action.payload;
    },
    setGroupDelete: (state, action: PayloadAction<CommandGroup | null>) => {
      state.group.delete = action.payload;
    },

    // Command modals
    setCommandCreate: (state, action: PayloadAction<boolean>) => {
      state.command.create = action.payload;
    },
    setCommandUpdate: (state, action: PayloadAction<Command | null>) => {
      state.command.update = action.payload;
    },
    setCommandDelete: (state, action: PayloadAction<Command | null>) => {
      state.command.delete = action.payload;
    },

    // Close all modals
    closeAllModals: (state) => {
      state.group.create = false;
      state.group.update = null;
      state.group.delete = null;
      state.command.create = false;
      state.command.update = null;
      state.command.delete = null;
    },
  },
});

export const {
  setGroupCreate,
  setGroupUpdate,
  setGroupDelete,
  setCommandCreate,
  setCommandUpdate,
  setCommandDelete,
  closeAllModals,
} = modalsSlice.actions;

export const selectModalsSlice = (state: RootState) => state.modals;
