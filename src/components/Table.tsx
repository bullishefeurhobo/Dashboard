import React, { useState } from 'react';
import RowModal from '../components/RowModal';
import Data from '../data/data';
import { ExpandLess, ExpandMore, FileDownloadDoneOutlined, NavigateBefore, NavigateNext, Search } from '@mui/icons-material';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; 

const Table: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    eventName: '',
    date: '',
  });
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(0);
  const [sortOrder, setSortOrder] = useState('asc');
  const [tableData, setTableData] = useState(Data());
  const [expandedRows, setExpandedRows] = useState<number[]>([]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleRowClick = (row: any) => {
    setSelectedRow(row);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleEditRow = (updatedRow: any) => {
    setTableData((prevData) =>
      prevData.map((row) => (row.id === updatedRow.id ? updatedRow : row))
    );
    closeModal();
  };

  const handleDeleteRow = (id: number) => {
    setTableData((prevData) => prevData.filter((row) => row.id !== id));
    closeModal();
  };

  const handleMarkComplete = (id: number) => {
    setTableData((prevData) =>
      prevData.map((row) => (row.id === id ? { ...row, status: 'Complete' } : row))
    );
    closeModal();
  };

  const sortedData = [...tableData].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return sortOrder === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
  });

  const filteredData = sortedData.filter((row) => {
    return (
      (filters.status ? row.status === filters.status : true) &&
      (filters.date ? row.date === filters.date : true) &&
      (searchQuery ? row.eventName.toLowerCase().includes(searchQuery.toLowerCase()) : true)
    );
  });

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(currentPage * pageSize, currentPage * pageSize + pageSize);

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Table Data', 14, 22);
    autoTable(doc, {
      head: [['Event Name', 'Date', 'Speaker', 'Status']],
      body: paginatedData.map((row) => [row.eventName, row.date, row.speaker, row.status]),
    });
    doc.save('table-data.pdf');
  };

  const toggleRowExpansion = (rowId: number) => {
    setExpandedRows((prevExpandedRows) =>
      prevExpandedRows.includes(rowId)
        ? prevExpandedRows.filter((id) => id !== rowId)
        : [...prevExpandedRows, rowId]
    );
  };

  return (
    <div>
      <div className="filters flex items-center gap-3 lg:flex-row flex-col">
        <div className="border p-2 rounded w-full lg:w-auto dark:bg-[#484554] dark:text-white dark:border-none flex items-center gap-2">
          <Search className='text-[#94A3B8]' />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            className='outline-none bg-transparent'
            onChange={handleSearch}
          />
        </div>

        <div className="border p-2 rounded w-full lg:w-auto dark:bg-[#484554] dark:text-white dark:border-none">
          <input
            type="date"
            name="date"
            className='outline-none bg-transparent'
            value={filters.date}
            onChange={handleFilterChange}
          />
        </div>
        <span className='p-2 lg:block hidden'>Total Items: {filteredData.length}</span>
        <div className="border p-2 rounded w-full lg:w-auto dark:bg-[#484554] dark:text-white dark:border-none">
          <select
            name="status"
            className='outline-none bg-transparent'
            value={filters.status}
            onChange={handleFilterChange}
          >
            <option value="">All Status</option>
            <option value="Complete">Complete</option>
            <option value="In Progress">In Progress</option>
          </select>
        </div>

        <div className="border p-2 rounded w-full lg:w-auto dark:bg-[#484554] dark:text-white dark:border-none">
          <select
            className='outline-none bg-transparent'
            value={sortOrder}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortOrder(e.target.value)}
          >
            <option value="asc"> Most Recent </option>
            <option value="desc">Least Recent </option>
          </select>
        </div>
        <div className="border p-2 rounded w-full lg:w-auto dark:bg-[#484554] dark:text-white dark:border-none flex items-start gap-2">
          <FileDownloadDoneOutlined />
          <button 
            className=""
            onClick={exportToPDF}>
            Export 
          </button>
        </div>
      </div>

      <div className="w-full lg:hidden">
        {paginatedData.map((row) => (
          <div key={row.id} className="border-b dark:border-gray-700">
            <div
              onClick={() => toggleRowExpansion(row.id)}
              className="flex justify-between items-center p-4 cursor-pointer dark:bg-[#484554] bg-[#F1F5F9]"
            >
              <div>
                <span className="font-semibold">{row.eventName}</span>
              </div>
              <div className="flex items-center">
                <span
                  onClick={() => handleRowClick(row)}
                  className={`px-3 py-1 rounded-full ${row.status === 'Complete' ? 'bg-[#d1fae5] text-[#10b981]' : 'bg-[#DBEAFE] text-[#3B82F6]'} dark:bg-transparent dark:border dark:border-${row.status === 'Complete' ? '[#10b981]' : '[#3B82F6]'}`}
                >
                  {row.status}
                </span>
                {expandedRows.includes(row.id) ? <ExpandLess /> : <ExpandMore />}
              </div>
            </div>

            {expandedRows.includes(row.id) && (
              <div className="p-4 bg-gray-50 dark:bg-gray-400">
                <div className="flex justify-between">
                  <div>
                    <span className="">Speaker: </span>{row.speaker}
                  </div>
                  <div>
                    <span className="">Date: </span>{row.date}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>




      <table className="table-auto w-full lg:table hidden">
        <thead className='dark:bg-[#6A6676] rounded bg-[#F1F5F9] dark:text-white'>
          <tr>
            <th className="px-6 py-5">Event Name</th>
            <th className="px-6 py-5">Date</th>
            <th className="px-6 py-5">Speaker</th>
            <th className="px-6 py-5">Status</th>
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((row) => (
            <tr key={row.id} onClick={() => handleRowClick(row)} style={{ cursor: 'pointer' }} className="hover:bg-gray-100 dark:bg-[#484554] dark:hover:bg-gray-600">
              <td className=" px-4 py-5">{row.eventName}</td>
              <td className=" px-4 py-5">{row.date}</td>
              <td className=" px-4 py-5">{row.speaker}</td>
              <td>
                <span className={` px-3 py-1 rounded-full ${row.status === 'Complete' ? ' bg-[#d1fae5]  text-[#10b981] dark:bg-transparent dark:border dark:border-[#10b981]' : 'bg-[#DBEAFE] text-[#3B82F6] dark:bg-transparent dark:border dark:border-[#3B82F6]'}`}>
                  •́ {row.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination my-4 flex">
        <div className="">
          <button
          className={` text-[#8576ff] font-bold p-2 px-3 rounded bg-gray-300 dark:bg-[#484554]`}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
            disabled={currentPage === 0}
          >
            <NavigateBefore/>
          </button>

          {Array.from({ length: 3 }, (_, index) => (
            <button
              key={index}
              className={`p-3 px-4 font-semibold mx-1 text-xs rounded-full ${index === currentPage ? 'bg-[#8576FF] text-white' : ''}`}
              onClick={() => setCurrentPage(index)}
            >
              {index + 1}
            </button>
          ))}

          <button
          className={` text-[#8576ff] font-bold p-2 px-3 rounded bg-gray-300 dark:bg-[#484554]`}
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
            disabled={currentPage === totalPages - 1}
          >
            <NavigateNext/>
          </button>
        </div>
        <div className=""></div>
      </div>

      {isModalOpen && selectedRow && (
        <RowModal
          row={selectedRow}
          onClose={closeModal}
          onEdit={handleEditRow}
          onDelete={handleDeleteRow}
          onMarkComplete={handleMarkComplete}
        />
      )}
    </div>
  );
};

export default Table;
