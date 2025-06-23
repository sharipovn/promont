import React from "react";
import { Pagination } from "react-bootstrap";
import './CustomPagination.css';
import { useI18n } from '../context/I18nProvider';


const CustomPagination = ({ currentPage, totalPages, onPageChange }) => {

const {  returnTitle } = useI18n(); // ✅ include returnTitle

  const handleNavigate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      onPageChange(pageNumber);
    }
  };

  const renderPaginationItems = () => {
    const items = [];

    // Previous
    items.push(
      <Pagination.Prev
        key="prev"
        disabled={currentPage === 1}
        onClick={() => handleNavigate(currentPage - 1)}
        className="custom-pagination-btn"
      >
        {returnTitle('app.previous_page')}
      </Pagination.Prev>
    );

    // Page numbers
    for (let num = 1; num <= totalPages; num++) {
      if (
        num <= 2 ||
        num > totalPages - 2 ||
        Math.abs(num - currentPage) <= 1
      ) {
        items.push(
          <Pagination.Item
            key={num}
            active={num === currentPage}
            onClick={() => handleNavigate(num)}
            className={`custom-pagination-btn ${num === currentPage ? 'active' : ''}`}
          >
            {num}
          </Pagination.Item>
        );
      } else if (
        num === 3 && currentPage > 5 ||
        num === totalPages - 2 && currentPage < totalPages - 3
      ) {
        items.push(<Pagination.Ellipsis key={`ellipsis-${num}`} disabled />);
      }
    }

    // Next
    items.push(
      <Pagination.Next
        key="next"
        disabled={currentPage === totalPages}
        onClick={() => handleNavigate(currentPage + 1)}
        className="custom-pagination-btn"
      >
        {returnTitle('app.next_page')}
      </Pagination.Next>
    );

    return items;
  };

  return (
    <div className="d-flex justify-content-center mt-4">
      <Pagination className="custom-pagination">{renderPaginationItems()}</Pagination>
    </div>
  );
};

export default CustomPagination;
