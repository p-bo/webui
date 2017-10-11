import {
  ApplicationRef,
  Component,
  Injector,
  OnInit,
  ViewContainerRef
} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormGroup,
  Validators
} from '@angular/forms';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import * as _ from 'lodash';
import {Subscription} from 'rxjs';
import {RestService, WebSocketService} from '../../../../services/';
import {
  FieldConfig
} from '../../../common/entity/entity-form/models/field-config.interface';

@Component({
  selector : 'app-alertservice-aws',
  template : `<entity-form [conf]="this"></entity-form>`
})
export class AlertServiceEditAWSComponent {

  protected resource_name = 'system/consulalerts';
  protected route_success: string[] = [ 'system', 'alertservice'];
  protected isEntity = true;
  
  
  protected fieldConfig: FieldConfig[] = [
    {
      type : 'input',
      name : 'consulalert_type',
      placeholder: 'counsulalert_type'
    },
    {
      type : 'input',
      name : 'base_url',
      placeholder : 'base_url'
    },
    {
      type : 'input',
      name : 'aws_access_key_id',
      placeholder : 'aws_access_key_id'
    },
    {
      type: 'input',
      name: 'aws_secret_access_key',
      placeholder: 'aws_secret_access_key',
    },
    {
      type : 'checkbox',
      name : 'enabled',
      placeholder : 'Enabled'
    },
  ];

  resource_transformIncommingRestData(data:any): any {
    data.aws_access_key_id = data.attributes.aws_access_key_id;
    data.aws_secret_access_key = data.attributes.aws_secret_access_key;
    data.base_url = data.attributes.base_url;
    return data;
  };


  constructor(
      protected router: Router,
      protected route: ActivatedRoute,
      protected rest: RestService,
      protected ws: WebSocketService,
      protected _injector: Injector,
      protected _appRef: ApplicationRef
  ) {}

  afterInit(entityForm: any) {
  }
}
