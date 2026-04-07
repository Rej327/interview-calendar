import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import candidatesReducer from "@/lib/store/candidatesSlice";
import InviteSpecificCandidateModal from "@/components/candidates/InviteSpecificCandidateModal";

// ─── Mock external dependencies ───────────────────────────────────────────────
jest.mock("@/app/actions/get", () => ({
  fetchRoles: jest.fn(),
}));
jest.mock("@/app/actions/post", () => ({
  createCandidate: jest.fn(),
  sendCandidateInvite: jest.fn(),
}));
jest.mock("@/app/actions/delete", () => ({
  deleteCandidate: jest.fn(),
}));
jest.mock("@mantine/notifications", () => ({
  notifications: { show: jest.fn() },
}));

import { fetchRoles } from "@/app/actions/get";
import { createCandidate, sendCandidateInvite } from "@/app/actions/post";
import { deleteCandidate } from "@/app/actions/delete";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const makeStore = () =>
  configureStore({ reducer: { candidates: candidatesReducer } });

const renderModal = (
  props: Partial<
    React.ComponentProps<typeof InviteSpecificCandidateModal>
  > = {},
) => {
  const store = makeStore();
  const defaultProps = {
    opened: true,
    onClose: jest.fn(),
    platform: "LinkedIn",
    ...props,
  };
  return {
    store,
    onClose: defaultProps.onClose,
    ...render(
      <Provider store={store}>
        <MantineProvider>
          <InviteSpecificCandidateModal {...defaultProps} />
        </MantineProvider>
      </Provider>,
    ),
  };
};

beforeEach(() => {
  jest.clearAllMocks();
  (fetchRoles as jest.Mock).mockResolvedValue({
    success: true,
    data: [{ role_id: "r1", role_title: "Software Engineer" }],
  });
});

// ─── Rendering ────────────────────────────────────────────────────────────────
describe("InviteSpecificCandidateModal – rendering", () => {
  it("renders modal title with platform name", async () => {
    renderModal({ platform: "LinkedIn" });
    expect(
      await screen.findByText(/Bulk Invite via LinkedIn/i),
    ).toBeInTheDocument();
  });

  it("renders form fields", async () => {
    renderModal();
    expect(await screen.findByPlaceholderText("John Doe")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("john@example.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Profile URL")).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    renderModal({ opened: false });
    expect(screen.queryByText(/Bulk Invite via/i)).not.toBeInTheDocument();
  });

  it('renders "Expand Batch" button to add more candidates', async () => {
    renderModal();
    expect(await screen.findByText("Expand Batch")).toBeInTheDocument();
  });
});

// ─── Platform icon ────────────────────────────────────────────────────────────
describe("InviteSpecificCandidateModal – platform handling", () => {
  it('uses "Bulk Invite via Indeed" when platform is Indeed', async () => {
    renderModal({ platform: "Indeed" });
    expect(
      await screen.findByText(/Bulk Invite via Indeed/i),
    ).toBeInTheDocument();
  });

  it('uses "Bulk Invite via Web" for unknown platforms', async () => {
    renderModal({ platform: "Web" });
    expect(await screen.findByText(/Bulk Invite via Web/i)).toBeInTheDocument();
  });
});

// ─── Batch expansion ──────────────────────────────────────────────────────────
describe("InviteSpecificCandidateModal – batch expansion", () => {
  it('adds a second candidate row when "Expand Batch" is clicked', async () => {
    renderModal();
    const expandBtn = await screen.findByText("Expand Batch");
    fireEvent.click(expandBtn);

    // Both rows should now render email inputs
    const emailInputs = screen.getAllByPlaceholderText("john@example.com");
    expect(emailInputs).toHaveLength(2);
  });
});

// ─── Successful submission ────────────────────────────────────────────────────
describe("InviteSpecificCandidateModal – successful submission", () => {
  it("shows success state after a valid submission", async () => {
    (createCandidate as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: { candidate_id: "c-new" },
    });
    (sendCandidateInvite as jest.Mock).mockResolvedValueOnce({
      success: true,
      message: "An invitation has been sent.",
    });

    renderModal();
    await screen.findByPlaceholderText("John Doe");

    fireEvent.change(screen.getByPlaceholderText("John Doe"), {
      target: { value: "Alice Smith" },
    });
    fireEvent.change(screen.getByPlaceholderText("john@example.com"), {
      target: { value: "alice@example.com" },
    });

    // Select a role (required by form validation)
    const roleSelect = screen.getByPlaceholderText("Select role");
    fireEvent.click(roleSelect);
    const roleOption = await screen.findByText("Software Engineer");
    fireEvent.click(roleOption);

    // Submit
    const submitBtn = screen.getByText(/Dispatch Batch/i);
    fireEvent.click(submitBtn);

    await waitFor(() =>
      expect(screen.getByText(/Operation Successful/i)).toBeInTheDocument(),
    );
  });
});

// ─── Failed submission & rollback ─────────────────────────────────────────────
describe("InviteSpecificCandidateModal – failed submission", () => {
  it("shows error state and triggers rollback when invite fails", async () => {
    (createCandidate as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: { candidate_id: "c-rollback" },
    });
    (sendCandidateInvite as jest.Mock).mockResolvedValueOnce({
      success: false,
      message: "Email service unavailable",
    });
    (deleteCandidate as jest.Mock).mockResolvedValueOnce({ success: true });

    renderModal();
    await screen.findByPlaceholderText("John Doe");

    fireEvent.change(screen.getByPlaceholderText("John Doe"), {
      target: { value: "Bob Jones" },
    });
    fireEvent.change(screen.getByPlaceholderText("john@example.com"), {
      target: { value: "bob@example.com" },
    });

    // Select a role (required by form validation)
    const roleSelect = screen.getByPlaceholderText("Select role");
    fireEvent.click(roleSelect);
    const roleOption = await screen.findByText("Software Engineer");
    fireEvent.click(roleOption);

    fireEvent.click(screen.getByText(/Dispatch Batch/i));

    await waitFor(() =>
      expect(
        screen.getByText(/Operational Fault Detected/i),
      ).toBeInTheDocument(),
    );
    expect(screen.getByText("Email service unavailable")).toBeInTheDocument();
  });

  it('shows "Go Back" button in error state', async () => {
    (createCandidate as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: { candidate_id: "c-err" },
    });
    (sendCandidateInvite as jest.Mock).mockResolvedValueOnce({
      success: false,
      message: "Timeout",
    });
    (deleteCandidate as jest.Mock).mockResolvedValueOnce({ success: true });

    renderModal();
    await screen.findByPlaceholderText("John Doe");
    fireEvent.change(screen.getByPlaceholderText("John Doe"), {
      target: { value: "Eve Test" },
    });
    fireEvent.change(screen.getByPlaceholderText("john@example.com"), {
      target: { value: "eve@test.com" },
    });
    // Select a role (required by form validation)
    const roleSelect = screen.getByPlaceholderText("Select role");
    fireEvent.click(roleSelect);
    const roleOption = await screen.findByText("Software Engineer");
    fireEvent.click(roleOption);

    fireEvent.click(screen.getByText(/Dispatch Batch/i));

    await waitFor(() => screen.getByText("Go Back"));
    fireEvent.click(screen.getByText("Go Back"));
    // Should return to the idle form
    expect(await screen.findByText("Expand Batch")).toBeInTheDocument();
  });
});
