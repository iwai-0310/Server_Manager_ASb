import { Component, OnInit } from '@angular/core';
import { Server } from './interface/server';
import { ServerService } from './service/server.service';
import { AppState } from './interface/app-state';
import { CustomResponse } from './interface/custom-response';
import { BehaviorSubject, Observable, catchError, map, of, startWith } from 'rxjs';
import { DataState } from './enum/data-state.enum';
import {Status} from './enum/status.enum'
import { NgForm } from '@angular/forms';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  
  title:string='serverapp'
  appState$:Observable<AppState<CustomResponse>>
  readonly DataState=DataState;
  readonly Status=Status;
  private filterSubject =new BehaviorSubject<string>('');
  private dataSubject =new BehaviorSubject<CustomResponse>(null);
  filterStatus$=this.filterSubject.asObservable();
  private isLoading =new BehaviorSubject<boolean>(false);
  isLoading$=this.isLoading.asObservable();
  selectedStatus:Status

  constructor(private serverService:ServerService){ }

  ngOnInit(): void {
    this.appState$=this.serverService.servers$
    .pipe(
      map(response =>{
        this.dataSubject.next(response)
        return {dataState:DataState.LOADED_STATE,appData:{...response,data:{servers: response.data.servers.reverse()}}}
      }),
      startWith({dataState:DataState.LOADING_STATE}),
      catchError((error:string)=>{
        return of({dataState:DataState.ERROR_STATE,error})
      })
    );
  }
//funciton to ping the server
  pingServer(ipAddress:string): void {
    this.filterSubject.next(ipAddress);
    this.appState$=this.serverService.ping$(ipAddress)
    .pipe(
      map(response =>{
        const currentData=this.dataSubject.value.data;
        if(currentData && currentData.servers){
        const index= this.dataSubject.value.data.servers.findIndex(server=>
            server.id===(response.data.server?.id || null))
            if(index!==-1){currentData.servers[index]=response.data.server}}
        // this.dataSubject.value.data.servers[index]=response.data.server
        this.filterSubject.next('');
        return {dataState:DataState.LOADED_STATE,appData:this.dataSubject.value}
      }),
      startWith({dataState:DataState.LOADED_STATE,appData:this.dataSubject.value}),
      catchError((error:string)=>{
        this.filterSubject.next('');
        return of({dataState:DataState.ERROR_STATE,error})
      })
    );
  }
//function to filter sever by server  up and server down
  filterServers(status:Status): void {
    
    this.appState$=this.serverService.filter$(status,this.dataSubject.value)
    .pipe(
      map(response =>{
       
        return {dataState:DataState.LOADED_STATE,appData:response}
      }),
      startWith({dataState:DataState.LOADED_STATE,appData:this.dataSubject.value}),
      catchError((error:string)=>{
       
        return of({dataState:DataState.ERROR_STATE,error})
      })
    );
  }
  //function tto save sever info to the db
  saveServer(serverForm:NgForm): void {
    this.isLoading.next(true);
    this.appState$=this.serverService.save$(serverForm.value as Server)
    .pipe(
      map(response =>{
       this.dataSubject.next(
        {...response,data:{servers:[response.data.server,...this.dataSubject.value.data.servers]}}
       );
       document.getElementById('closeModal').click();
       this.isLoading.next(false);
       serverForm.resetForm({status: this.Status.SERVER_DOWN});
        return {dataState:DataState.LOADED_STATE,appData:this.dataSubject.value}
      }),
      startWith({dataState:DataState.LOADED_STATE,appData:this.dataSubject.value}),
      catchError((error:string)=>{
        this.isLoading.next(false);
        return of({dataState:DataState.ERROR_STATE,error})
      })
    );
  }
  //function to delete server
  deleteServer(server:Server): void {
    this.appState$=this.serverService.delete$(server.id)
    .pipe(
      map(response =>{
        this.dataSubject.next(
          {...response,data:{
            servers:this.dataSubject.value.data.servers.filter(s=>s.id!==server.id)}}
        )  
        return {dataState:DataState.LOADED_STATE,appData:this.dataSubject.value}
      }),
      startWith({dataState:DataState.LOADED_STATE,appData:this.dataSubject.value}),
      catchError((error:string)=>{
        return of({dataState:DataState.ERROR_STATE,error})
      })
    );
  }
  //function to print
  printReport(): void {
    let datatype = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'; // Change content type to XLSX
    let tableSelect = document.getElementById('servers');
    
    if (tableSelect) {
      let tableHtml = tableSelect.outerHTML;
      let downloadLink = document.createElement('a');
      document.body.appendChild(downloadLink);
      downloadLink.href = 'data:' + datatype + ', ' + encodeURIComponent(tableHtml);
      downloadLink.download = 'server-report.xlsx'; // Change the file extension to .xlsx
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } else {
      console.error("Table with ID 'servers' not found.");
    }
  }
}
