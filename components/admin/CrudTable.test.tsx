import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { CrudTable, ColumnDef } from "./CrudTable";

interface TestItem {
  id: string;
  name: string;
  count: number;
}

const columns: ColumnDef<TestItem>[] = [
  { key: "name", header: "Nama" },
  { key: "count", header: "Jumlah" },
];

const sampleData: TestItem[] = [
  { id: "1", name: "Materi A", count: 3 },
  { id: "2", name: "Materi B", count: 5 },
  { id: "3", name: "Materi C", count: 1 },
];

const defaultProps = {
  data: sampleData,
  columns,
  onAdd: vi.fn(),
  onEdit: vi.fn(),
  onDelete: vi.fn(),
  isLoading: false,
  getRowKey: (item: TestItem) => item.id,
  getItemName: (item: TestItem) => item.name,
};

describe("CrudTable", () => {
  it("renders table with data and columns", () => {
    render(<CrudTable {...defaultProps} />);

    expect(screen.getByText("Nama")).toBeInTheDocument();
    expect(screen.getByText("Jumlah")).toBeInTheDocument();
    expect(screen.getByText("Materi A")).toBeInTheDocument();
    expect(screen.getByText("Materi B")).toBeInTheDocument();
    expect(screen.getByText("Materi C")).toBeInTheDocument();
  });

  it("renders empty state when no data", () => {
    render(<CrudTable {...defaultProps} data={[]} />);

    expect(screen.getByText("Belum ada data.")).toBeInTheDocument();
  });

  it("shows loading skeleton when isLoading is true", () => {
    render(<CrudTable {...defaultProps} isLoading={true} />);

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("calls onAdd when Tambah button is clicked", async () => {
    const user = userEvent.setup();
    render(<CrudTable {...defaultProps} />);

    await user.click(screen.getByText("Tambah"));
    expect(defaultProps.onAdd).toHaveBeenCalledTimes(1);
  });

  it("calls onEdit when Ubah button is clicked", async () => {
    const user = userEvent.setup();
    render(<CrudTable {...defaultProps} />);

    const editButtons = screen.getAllByText("Ubah");
    await user.click(editButtons[0]);
    expect(defaultProps.onEdit).toHaveBeenCalledWith(sampleData[0]);
  });

  it("shows delete confirmation dialog before deleting", async () => {
    const user = userEvent.setup();
    render(<CrudTable {...defaultProps} />);

    const deleteButtons = screen.getAllByText("Hapus");
    await user.click(deleteButtons[0]);

    // Confirmation dialog should appear
    expect(screen.getByText("Konfirmasi Hapus")).toBeInTheDocument();
    const dialog = screen.getByRole("alertdialog");
    expect(within(dialog).getByText(/Materi A/)).toBeInTheDocument();
  });

  it("calls onDelete after confirming deletion", async () => {
    const user = userEvent.setup();
    render(<CrudTable {...defaultProps} />);

    const deleteButtons = screen.getAllByText("Hapus");
    await user.click(deleteButtons[1]);

    // Click the confirm "Hapus" button inside dialog
    const dialog = screen.getByRole("alertdialog");
    const confirmBtn = within(dialog).getByRole("button", { name: /hapus/i });
    await user.click(confirmBtn);

    expect(defaultProps.onDelete).toHaveBeenCalledWith(sampleData[1]);
  });

  it("does not call onDelete when cancel is clicked", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(<CrudTable {...defaultProps} onDelete={onDelete} />);

    const deleteButtons = screen.getAllByText("Hapus");
    await user.click(deleteButtons[0]);

    const dialog = screen.getByRole("alertdialog");
    await user.click(within(dialog).getByText("Batal"));

    expect(onDelete).not.toHaveBeenCalled();
  });

  it("renders search input when searchConfig is provided", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <CrudTable
        {...defaultProps}
        searchConfig={{ value: "", onChange, placeholder: "Cari materi..." }}
      />
    );

    const searchInput = screen.getByPlaceholderText("Cari materi...");
    expect(searchInput).toBeInTheDocument();

    await user.type(searchInput, "A");
    expect(onChange).toHaveBeenCalled();
  });

  it("renders pagination when config is provided", () => {
    render(
      <CrudTable
        {...defaultProps}
        pagination={{
          currentPage: 2,
          totalPages: 5,
          pageSize: 20,
          onPageChange: vi.fn(),
        }}
      />
    );

    expect(screen.getByText("Halaman 2 dari 5")).toBeInTheDocument();
    expect(screen.getByLabelText("Halaman sebelumnya")).toBeEnabled();
    expect(screen.getByLabelText("Halaman berikutnya")).toBeEnabled();
  });

  it("disables previous button on first page", () => {
    render(
      <CrudTable
        {...defaultProps}
        pagination={{
          currentPage: 1,
          totalPages: 3,
          pageSize: 20,
          onPageChange: vi.fn(),
        }}
      />
    );

    expect(screen.getByLabelText("Halaman sebelumnya")).toBeDisabled();
  });

  it("disables next button on last page", () => {
    render(
      <CrudTable
        {...defaultProps}
        pagination={{
          currentPage: 3,
          totalPages: 3,
          pageSize: 20,
          onPageChange: vi.fn(),
        }}
      />
    );

    expect(screen.getByLabelText("Halaman berikutnya")).toBeDisabled();
  });

  it("calls onPageChange when pagination buttons are clicked", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();

    render(
      <CrudTable
        {...defaultProps}
        pagination={{
          currentPage: 2,
          totalPages: 5,
          pageSize: 20,
          onPageChange,
        }}
      />
    );

    await user.click(screen.getByLabelText("Halaman berikutnya"));
    expect(onPageChange).toHaveBeenCalledWith(3);

    await user.click(screen.getByLabelText("Halaman sebelumnya"));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it("does not show pagination when totalPages is 1", () => {
    render(
      <CrudTable
        {...defaultProps}
        pagination={{
          currentPage: 1,
          totalPages: 1,
          pageSize: 20,
          onPageChange: vi.fn(),
        }}
      />
    );

    expect(screen.queryByText(/Halaman/)).not.toBeInTheDocument();
  });

  it("supports custom column renderers", () => {
    const customColumns: ColumnDef<TestItem>[] = [
      { key: "name", header: "Nama", render: (item) => <strong>{item.name}</strong> },
      { key: "count", header: "Jumlah", render: (item) => `${item.count} bab` },
    ];

    render(<CrudTable {...defaultProps} columns={customColumns} />);

    expect(screen.getByText("3 bab")).toBeInTheDocument();
    expect(screen.getByText("5 bab")).toBeInTheDocument();
  });

  it("uses green variant for Ubah button and red for Hapus button", () => {
    render(<CrudTable {...defaultProps} />);

    const editButtons = screen.getAllByText("Ubah");
    const deleteButtons = screen.getAllByText("Hapus");

    // Edit buttons should have default (green primary) variant
    editButtons.forEach((btn) => {
      expect(btn.closest("button")).toHaveClass("bg-primary-600");
    });

    // Delete buttons should have destructive (red) variant
    deleteButtons.forEach((btn) => {
      expect(btn.closest("button")).toHaveClass("bg-destructive");
    });
  });

  it("renders custom add label", () => {
    render(<CrudTable {...defaultProps} addLabel="Tambah Materi" />);

    expect(screen.getByText("Tambah Materi")).toBeInTheDocument();
  });
});
