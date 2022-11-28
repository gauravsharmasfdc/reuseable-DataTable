/**
 * HOW TO USE THIS REUSABLE DATA TABLE COMPONENT
 * Use this component to show data in tabuler format with pagination, sorting feature
 *      Requiered Parameter:
 *          records : data in JSON Formate( Id field is Mandatory in records )
 *          tableColumns : table column data in JSON format
 *          setUrlFieldMapping : Required only if, table column contains any url type data
 *          setRecordPerPage : (Optional), Record per page
 *          setSortedBy :  default sort field
 *
 */

import { LightningElement, track, api, wire } from 'lwc';
import No_Record_Found_Queue_Management from '@salesforce/label/c.No_Record_Found_Queue_Management';

export default class ReusableDataTable extends LightningElement {
    @api tableRecords = [];
    @api tableHeader = '';
    @api multiSelect = false;

    @track recordsToDisplay = [];
    @track selectedRows = [];

    columns = [];
    urlFieldMapping = {};
    recordPerPage = 50;
    sortedBy;
    sortDirection = 'desc';

    isDataAvailable = false;
    label = {
        No_Record_Found_Queue_Management
    };

    totalPages = 1;
    pageNo;
    totalRecords;
    defaultSortDirection = 'asc';

    // Public property setter & getter

    @api set records(value) {
        this.tableRecords = [...value];
        this.selectedRows = [];
        this.processData();
    }
    get records() {
        return this.tableRecords;
    }

    @api set tableColumns(value) {
        this.columns = value;
        this.processData();
    }
    get tableColumns() {
        return this.columns;
    }

    @api set setUrlFieldMapping(value) {
        this.urlFieldMapping = Object.assign({}, value);
        this.processData();
    }
    get setUrlFieldMapping() {
        return this.urlFieldMapping;
    }

    @api set setRecordPerPage(value) {
        this.recordPerPage = value;
        this.processData();
    }
    get setRecordPerPage() {
        return this.recordPerPage;
    }

    @api set setSortedBy(value) {
        this.sortedBy = value;
        this.processData();
    }
    get setSortedBy() {
        return this.sortedBy;
    }

    @api set setSortDirection(value) {
        this.sortDirection = value;
        this.processData();
    }
    get setSortDirection() {
        return this.sortDirection;
    }

    connectedCallback() {
        console.log('reusableDataTable Loaded');
    }

    // All Getter methods
    get isRecordsMore() {
        return this.totalRecords > this.recordPerPage;
    }

    get isPreviousButtonDisabled() {
        return this.pageNo == 1;
    }

    get isNextButtonDisabled() {
        return this.pageNo >= this.totalPages;
    }

    get maxRowSelection() {
        return this.multiSelect ? '1000' : '1';
    }

    // Event handlers
    handleRowSelection(event) {
        const selectedRows = event.detail.selectedRows;
        let selectedRowlist = [];
        for (let i = 0; i < selectedRows.length; i++) {
            selectedRowlist.push(selectedRows[i].Id);
        }
        this.selectedRows = selectedRowlist;
        this.onRowSelection();
    }

    onRowSelection() {
        const passEventr = new CustomEvent('rowselection', {
            detail: { selectedRowIds: this.selectedRows }
        });
        this.dispatchEvent(passEventr);
    }

    setRecordsToDisplay() {
        this.totalRecords = this.tableRecords.length;
        let totalRecords = this.tableRecords.length;
        this.pageNo = 1;
        this.totalPages = Math.ceil(totalRecords / this.recordPerPage);
        this.preparePaginationList();
    }

    preparePaginationList() {
        let begin = (this.pageNo - 1) * parseInt(this.recordPerPage);
        let end = parseInt(begin) + parseInt(this.recordPerPage);
        this.recordsToDisplay = this.tableRecords.slice(begin, end);
    }

    handleNext() {
        this.pageNo += 1;
        this.preparePaginationList();
    }

    handlePrevious() {
        this.pageNo -= 1;
        this.preparePaginationList();
    }

    handleFirst() {
        this.pageNo = 1;
        this.preparePaginationList();
    }

    handleLast() {
        this.pageNo = this.totalPages;
        this.preparePaginationList();
    }

    handleSort(event) {
        let fieldName = event.detail.fieldName;
        let sortDirection = event.detail.sortDirection;

        this.sortData(fieldName, sortDirection);
    }

    sortData(_fieldName, _sortDirection) {
        let field_Name = _fieldName;
        let sort_Direction = _sortDirection;
        if (this.urlFieldMapping.hasOwnProperty(field_Name)) {
            field_Name = this.urlFieldMapping[field_Name];
        }
        const cloneData = [...this.tableRecords];
        cloneData.sort(
            this.sortBy(field_Name, sort_Direction === 'asc' ? 1 : -1)
        );
        this.tableRecords = cloneData;
        if (this.urlFieldMapping.hasOwnProperty(field_Name)) {
            field_Name = this.urlFieldMapping[field_Name];
        }
        this.sortedBy = field_Name;
        this.sortDirection = sort_Direction;
        this.setRecordsToDisplay();
    }
    sortBy(field, reverse, primer) {
        const key = primer
            ? function (x) {
                  return primer(x[field]);
              }
            : function (x) {
                  return x[field];
              };

        return function (a, b) {
            if (typeof key(a) == 'string' && typeof key(b) == 'string') {
                a = key(a).toLowerCase();
                b = key(b).toLowerCase();
                return reverse * ((a > b) - (b > a));
            } else {
                a = key(a);
                b = key(b);
                return reverse * ((a > b) - (b > a));
            }
        };
    }

    processData() {
        if (this.tableRecords.length) {
            this.isDataAvailable = true;
            if (this.columns && this.columns.length && this.sortedBy) {
                this.sortData(this.sortedBy, this.sortDirection);
            }
        } else {
            this.isDataAvailable = false;
        }
    }
}