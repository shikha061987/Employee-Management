import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

import { EmployeeService } from './services/employee.service';

import { EmpAddEditComponent } from './emp-add-edit/emp-add-edit.component';
import { CoreService } from './core/core.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'crud-app';
  loading: boolean = true;
  pagedMobileData: any[] = [];

  displayedColumns: string[] = [
    'id',
    'firstName',
    'lastName',
    'email',
    'dob',
    'gender',
    'education',
    'company',
    'experience',
    'package',
    'action',
  ];
  dataSource!: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private _dialog: MatDialog,
    private _empService: EmployeeService,
    private _coreService: CoreService
  ) {}

  ngOnInit(): void {
    this.getEmployeeList();
    this.adjustColumns(window.innerWidth);

    window.addEventListener('resize', () => {
      this.adjustColumns(window.innerWidth);
    });
  }

  adjustColumns(width: number) {
    if (width < 768) {
      this.displayedColumns = [
        'firstName',
        'lastName',
        'dob',
        'gender',
        'action',
      ];
    } else {
      this.displayedColumns = [
        'id',
        'firstName',
        'lastName',
        'email',
        'dob',
        'gender',
        'action',
      ];
    }
  }

  openAddEditEmpForm() {
    const DialogRef = this._dialog.open(EmpAddEditComponent);
    DialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val) {
          this.getEmployeeList();
        }
      },
    });
  }

  ngAfterViewInit() {
    this.paginator.page.subscribe(() => {
      this.updateMobilePagedData();
    });
  }
  getEmployeeList() {
    this.loading = true;

    this._empService.getEmployeeList().subscribe({
      next: (res) => {
        this.dataSource = new MatTableDataSource(res);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;

        this.updateMobilePagedData(); // 🔥 IMPORTANT

        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }
  updateMobilePagedData() {
    if (!this.paginator) return;

    const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
    const endIndex = startIndex + this.paginator.pageSize;

    this.pagedMobileData = this.dataSource.filteredData.slice(
      startIndex,
      endIndex
    );
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.paginator) {
      this.paginator.firstPage();
    }

    this.updateMobilePagedData(); //
  }

  deleteEmployee(id: number) {
    this._empService.deleteEmployee(id).subscribe({
      next: (res) => {
        // console.log("Employee Data Deleted Successfully")
        this._coreService.openSnackBar('Employee Data Deleted Successfully');
        this.getEmployeeList();
      },
      error: console.log,
    });
  }

  openEditEmpForm(data: any) {
    const DialogRef = this._dialog.open(EmpAddEditComponent, {
      data,
    });

    DialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val) {
          this.getEmployeeList();
        }
      },
    });
  }
}
