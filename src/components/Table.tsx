import { useState } from "react";
import RowModal from "../components/RowModal";
import Data, { TableRow } from "../data/data";
import {
  ExpandLess,
  ExpandMore,
  FileDownloadDoneOutlined,
  NavigateBefore,
  NavigateNext,
  Search,
} from "@mui/icons-material";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Table = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    date: "",
  });
  const [selectedRow, setSelectedRow] = useState<TableRow | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(0);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [tableData, setTableData] = useState<TableRow[]>(Data());
  const [expandedRows, setExpandedRows] = useState<number[]>([]);

  const sortedData = [...tableData].sort((a, b) => {
    const aTime = new Date(a.date).getTime();
    const bTime = new Date(b.date).getTime();
    return sortOrder === "asc" ? bTime - aTime : aTime - bTime;
  });

  const filteredData = sortedData.filter((row) => {
    return (
      (!filters.status || row.status === filters.status) &&
      (!filters.date || row.date === filters.date) &&
      (!searchQuery ||
        row.eventName.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    currentPage * pageSize,
    currentPage * pageSize + pageSize
  );

  const exportToPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [["Event", "Date", "Speaker", "Status"]],
      body: filteredData.map((row) => [
        row.eventName,
        row.date,
        row.speaker,
        row.status,
      ]),
    });
    doc.save("table-data.pdf");
  };

  const toggleRowExpansion = (id: number) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 border p-2 rounded">
          <Search />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="outline-none bg-transparent"
          />
        </div>

        <input
          type="date"
          value={filters.date}
          onChange={(e) =>
            setFilters((f) => ({ ...f, date: e.target.value }))
          }
          className="border p-2 rounded"
        />

        <select
          value={filters.status}
          onChange={(e) =>
            setFilters((f) => ({ ...f, status: e.target.value }))
          }
          className="border p-2 rounded"
        >
          <option value="">All Status</option>
          <option value="Complete">Complete</option>
          <option value="In Progress">In Progress</option>
        </select>

        <button
          onClick={exportToPDF}
          className="flex items-center gap-2 border p-2 rounded"
        >
          <FileDownloadDoneOutlined /> Export
        </button>
      </div>

      {/* Mobile View */}
      <div className="lg:hidden">
        {paginatedData.map((row) => (
          <div key={row.id} className="border rounded mb-2">
            <div
              className="flex justify-between p-3 cursor-pointer"
              onClick={() => toggleRowExpansion(row.id)}
            >
              <span className="font-semibold">{row.eventName}</span>
              {expandedRows.includes(row.id) ? (
                <ExpandLess />
              ) : (
                <ExpandMore />
              )}
            </div>

            {expandedRows.includes(row.id) && (
              <div className="p-3 text-sm space-y-1">
                <p>Speaker: {row.speaker}</p>
                <p>Date: {row.date}</p>
                <p>Status: {row.status}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Desktop Table */}
      <table className="hidden lg:table w-full border">
        <thead>
          <tr>
            <th>Event</th>
            <th>Date</th>
            <th>Speaker</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((row) => (
            <tr
              key={row.id}
              onClick={() => {
                setSelectedRow(row);
                setIsModalOpen(true);
              }}
              className="cursor-pointer hover:bg-gray-100"
            >
              <td>{row.eventName}</td>
              <td>{row.date}</td>
              <td>{row.speaker}</td>
              <td>{row.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex gap-2 items-center">
        <button
          disabled={currentPage === 0}
          onClick={() => setCurrentPage((p) => p - 1)}
        >
          <NavigateBefore />
        </button>

        <span>
          Page {currentPage + 1} of {totalPages}
        </span>

        <button
          disabled={currentPage === totalPages - 1}
          onClick={() => setCurrentPage((p) => p + 1)}
        >
          <NavigateNext />
        </button>
      </div>

      {isModalOpen && selectedRow && (
        <RowModal
          row={selectedRow}
          onClose={() => setIsModalOpen(false)}
          onEdit={(row) =>
            setTableData((d) => d.map((r) => (r.id === row.id ? row : r)))
          }
          onDelete={(id) =>
            setTableData((d) => d.filter((r) => r.id !== id))
          }
          onMarkComplete={(id) =>
            setTableData((d) =>
              d.map((r) =>
                r.id === id ? { ...r, status: "Complete" } : r
              )
            )
          }
        />
      )}
    </div>
  );
};

export default Table;
