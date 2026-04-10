import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import candidatesReducer from "@/lib/store/candidatesSlice";
import UpdateCandidateModal from "@/components/candidates/UpdateCandidateModal";
import { fetchRoles } from "@/app/actions/get";
import * as candidatesSlice from "@/lib/store/candidatesSlice";

// Mock dependencies
jest.mock("@/app/actions/get", () => ({
  fetchRoles: jest.fn(),
}));

jest.mock("@/lib/store/candidatesSlice", () => {
  const actual = jest.requireActual("@/lib/store/candidatesSlice");
  return {
    ...actual,
    updateCandidate: jest.fn(),
    deleteCandidate: jest.fn(),
  };
});

jest.mock("@mantine/notifications", () => ({
  notifications: { show: jest.fn() },
}));

jest.mock("@mantine/modals", () => ({
  modals: {
    openConfirmModal: jest.fn(({ onConfirm }) => {
      // simulate instant confirm click
      onConfirm();
    }),
  },
}));


const makeStore = () =>
  configureStore({
    reducer: { candidates: candidatesReducer },
  });

const renderModal = (props: any = {}) => {
  const store = makeStore();
  const defaultProps = {
    opened: true,
    onClose: jest.fn(),
    candidate: {
      candidate_id: "c1",
      name: "John Smith",
      email: "john@example.com",
      role: "Developer",
      status: "ACTIVE",
      avatar: "/avatar.png",
    },
    ...props,
  };
  return {
    store,
    onClose: defaultProps.onClose,
    ...render(
      <Provider store={store}>
        <MantineProvider>
          <UpdateCandidateModal {...defaultProps} />
        </MantineProvider>
      </Provider>
    ),
  };
};

describe("UpdateCandidateModal – integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetchRoles as jest.Mock).mockResolvedValue({
      success: true,
      data: [{ role_id: "r1", role_title: "Developer" }],
    });
  });

  it("renders with candidate form defaults", async () => {
    renderModal();
    // Use value check
    await waitFor(() => {
        expect(screen.getByDisplayValue("John Smith")).toBeInTheDocument();
        expect(screen.getByDisplayValue("john@example.com")).toBeInTheDocument();
        expect(screen.getAllByDisplayValue("ACTIVE")[0]).toBeInTheDocument();
    });
  });

  it("dispatches updateCandidate on submit", async () => {
    (candidatesSlice.updateCandidate as unknown as jest.Mock).mockReturnValue({
      type: "updateCandidate/mocked",
      unwrap: () => Promise.resolve({}),
    });

    renderModal();

    await waitFor(() => {
        expect(screen.getByDisplayValue("John Smith")).toBeInTheDocument();
    });
    
    // Change name
    const nameInput = screen.getByDisplayValue("John Smith");
    fireEvent.change(nameInput, { target: { value: "John Doe" } });

    const submitBtn = screen.getByText("Save Changes");
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(candidatesSlice.updateCandidate).toHaveBeenCalledWith(
        expect.objectContaining({
          candidate_id: "c1",
          full_name: "John Doe",
          email: "john@example.com",
        })
      );
    });
  });

  it("dispatches deleteCandidate and opens modal confirm on delete", async () => {
    (candidatesSlice.deleteCandidate as unknown as jest.Mock).mockReturnValue({
        type: "deleteCandidate/mocked",
        unwrap: () => Promise.resolve({}),
    });

    renderModal();
    const deleteBtn = screen.getByRole("button", { name: "Delete" });
    
    fireEvent.click(deleteBtn);

    // Because modals.openConfirmModal triggers we can either intercept the logic 
    // or we see that our mock automatically fired onConfirm. 
    // If it automatically fired, wait for the call.
    await waitFor(() => {
      expect(candidatesSlice.deleteCandidate).toHaveBeenCalledWith("c1");
    });
  });
});

