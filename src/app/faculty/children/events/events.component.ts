import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonService } from "../../providers/common.service";
import { EventService } from "../../providers/event.service";

declare let $: any;
@Component({
  selector: 'events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss', './../../faculty.component.scss']
})
export class EventsComponent implements OnInit {
  event:any;
  file:any;
  serveUrl:any;
  allEvents: any;
  branch:any;
  branchName:any
  submitProgress:boolean=false;;
  loader:boolean=true;
  modalHeading:string="";
  modalBody:string="";
  public selected:any;
  public editEvent:FormGroup;

  constructor(
    public cs:CommonService,
    public es:EventService
  ) {
  }

  ngOnInit() {
    this.branch=localStorage.getItem('branch');
    this.getBranchName();
    this.event=this.initForm();
    this.editEvent = this.EditForm();
  }

  public initForm(){
    return new FormGroup({
      branch:new FormControl(this.branch,[Validators.required]),
      title: new FormControl('',[Validators.required, Validators.maxLength(250)]),
      date: new FormControl('',[Validators.required]),
      events:new FormControl('', [Validators.required])
    })
  }

  public EditForm(){
  return new FormGroup({
      branch:new FormControl(this.branch,[Validators.required]),
      title: new FormControl('',[Validators.required, Validators.maxLength(250)]),
      date: new FormControl('',[Validators.required]),
      events:new FormControl('', [Validators.required])
    })
  }


onDueDate(e: any) {
    if (new Date(e.target.value) < new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())) {
      alert("Please choose an upcoming date from the calendar.");
      this.event.controls['date'].patchValue(this.getTomorrow());
    }
  }

  getTomorrow(){
    var currentDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
    var day = ("0" + (currentDate.getDate())).slice(-2)
    var month = ("0" + (currentDate.getMonth() + 1)).slice(-2)
    var year = currentDate.getFullYear()
    let tomorrow = year + '-' + month + '-' + day;
    return tomorrow;
  }

  eventsSubmit(){
    this.submitProgress=true;
    let formData = new FormData();
  formData.append('branch',this.event.value['branch']);
    formData.append('title', this.event.value['title']);
    formData.append('date', this.event.value['date']);
    formData.append('events', this.file);
    this.onSubmit(formData);
  }

  onSubmit(formData:any){
    this.submitProgress=true;
    this.es.postEvent(formData).subscribe(res=>{
      this.submitProgress=false;
      this.modalHeading="Success Submit";
      this.modalBody="You have successfully submit the event";
      $('#successModal').modal('show');
      this.getEvents();
    },err=>{
      this.submitProgress=false;
    })
  }

  getBranchName(){
      this.cs.getBranchName().subscribe(response=>{
      this.branchName=response.text();
      this.branchName=this.branchName.toLowerCase();
      this.getEvents();
    },err=>{

    })
  }

    getEvents(){
        this.loader=true;
        this.es.getEvents(this.branchName).subscribe(res=>{
            this.loader=false;
            this.allEvents=res.json();
        },err=>{
            this.loader=false;
        })
  }


  getFile(event: any) {
    this.file = event.srcElement.files[0];
}

eventEditSubmit(id:any){
  this.submitProgress=true;
  let formData = new FormData();
formData.append('branch',this.editEvent.value['branch']);
  formData.append('title', this.editEvent.value['title']);
  formData.append('date', this.editEvent.value['date']);
  formData.append('events', this.file);
  this.onEditSubmit(id,formData);
}



  onEditSubmit(id:any,formData:any){
    this.submitProgress=true;
    console.log(formData);
    this.es.editEvents(id,formData).subscribe(res=>{
      this.submitProgress=false;
      this.getEvents();
      this.modalHeading="Success Edit";
      this.modalBody="You have successfully Edit the event";
      $('#successModal').modal('show');
    },err=>{
        this.submitProgress = false;
    })
  }


      deleteEvent(id:any){
        let formData = new FormData();
      formData.append('branch',this.branch);
        this.es.deleteEvent(id,formData).subscribe(res=>{
          console.log("I am deleted");
          this.getEvents();
          this.modalHeading="Success Delete";
          this.modalBody="You have successfully deleted the event";
          $('#successModal').modal('show');
        },err=>{

        })
      }

      onEditEvent(e:any){
        this.selected=e;
        console.log(e);
      }
}
