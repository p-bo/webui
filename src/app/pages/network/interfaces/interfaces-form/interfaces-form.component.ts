import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray } from '@angular/forms';
import * as _ from 'lodash';

import { NetworkService, RestService } from '../../../../services';
import {
  FieldConfig
} from '../../../common/entity/entity-form/models/field-config.interface';
import { 
  EntityFormService 
} from '../../../common/entity/entity-form/services/entity-form.service';
import { 
  IPV4_REGEXP, IPV6_REGEXP, regexValidator 
} from '../../../common/entity/entity-form/validators/regex-validation';


@Component({
  selector : 'app-interfaces-form',
  template : `<entity-form [conf]="this"></entity-form>`
})
export class InterfacesFormComponent {
  
  protected resource_name: string = 'network/interface/';
  protected route_success: string[] = [ 'network', 'interfaces' ];
  protected isEntity: boolean = true;
  protected formArray: FormArray;
  
  public fieldConfig: FieldConfig[] = [
    {
      type : 'input',
      name : 'int_interface',
      placeholder : 'NIC',
      tooltip : 'The FreeBSD device name of the interface; a read-only\
 field when editing an interface.',
    },
    {
      type : 'input',
      name : 'int_name',
      placeholder : 'Interface Name',
      tooltip : 'Description of interface.',
    },
    {
      type : 'checkbox',
      name : 'int_dhcp',
      placeholder : 'DHCP',
      tooltip : 'Requires static IPv4 or IPv6 configuration if\
 unchecked; only one interface can be configured for <b>DHCP</b>'
    },
    {
      type : 'input',
      name : 'int_ipv4address',
      placeholder : 'IPv4 Address',
      tooltip : 'Enter a static IP address if <b>DHCP</b> is unchecked.',
      validation : [ regexValidator(IPV4_REGEXP) ],
      value : '',
      relation : [
        {action : "DISABLE", when : [ {name : "int_dhcp", value : true} ]}
      ]
    },
    {
      type : 'select',
      name : 'int_v4netmaskbit',
      placeholder : 'IPv4 Netmask',
      tooltip : 'Enter a netmask if <b>DHCP</b> is unchecked.',
      options : [],
      relation : [
        {
          action : "DISABLE",
          connective : "OR",
          when : [ 
            {name : "int_dhcp", value : true}, 
            {name : "int_ipv4address", value : "", status : "INVALID"} 
          ]
        }
      ]
    },
    {
      type : 'checkbox',
      name : 'int_ipv6auto',
      placeholder : 'Auto configure IPv6',
      tooltip : 'When enabled, automatically configurate IPv6 address via rtsol(8).'
    },
    {
      type : 'input',
      name : 'int_ipv6address',
      placeholder : 'IPv6 Address',
      tooltip : 'Enter a static IP address if <b>DHCP</b> is unchecked.',
      validation : [ regexValidator(IPV6_REGEXP) ],
      value : '',
      relation : [
        {action : "DISABLE", when : [ {name : "int_ipv6auto", value : true, status : "INVALID"} ]}
      ]
    },
    {
      type : 'select',
      name : 'int_v6netmaskbit',
      placeholder : 'IPv6 Prefix Length',
      options : [],
      relation : [
        {
          action : "DISABLE",
          connective : "OR",
          when : [ 
            {name : "int_ipv6auto", value : true},
            {name : "int_ipv6address", value : "", status : "INVALID"}
          ]
        }
      ]
    },
    {
      type : 'input',
      name : 'int_options',
      placeholder : 'Options',
      tooltip : 'Additional parameters from ifconfig(8). Seperate\
 multiple paramerters with a space.',
    },
    {
      type : 'array',
      name : 'int_aliases',
      placeholder : 'Alias',
      initialCount : 1,
      formarray : [
      {
        type : 'input',
        name : 'int_alias_v4address',
        placeholder : 'IPv4 Address',
        tooltip : 'Enter a static IP address if <b>DHCP</b> is unchecked.',
        validation : [ regexValidator(IPV4_REGEXP) ],
        value : ''
      },
      {
        type : 'select',
        name : 'int_alias_v4netmaskbit',
        placeholder : 'IPv4 Netmask',
        tooltip : 'Enter a netmask if <b>DHCP</b> is unchecked.',
        options : [],
      },
      {
        type : 'input',
        name : 'int_alias_v6address',
        placeholder : 'IPv6 Address',
        tooltip : 'Enter a static IP address if <b>DHCP</b> is unchecked.',
        validation : [ regexValidator(IPV6_REGEXP) ],
        value : ''
      },
      {
        type : 'select',
        name : 'int_alias_v6netmaskbit',
        placeholder : 'IPv6 Prefix Length',
        options : [],
      }]
    },
  ];

  protected arrayControl: any;
  protected initialCount: number = 1;
  protected initialCount_default: number = 1;

  public custActions: Array<any> = [
    {
      id : 'add_alias',
      name : 'Add extra Alias',
      function : () => {
        this.arrayControl.formarray[0].validation = [ regexValidator(IPV4_REGEXP) ];
        this.arrayControl.formarray[2].validation = [ regexValidator(IPV6_REGEXP) ];

        this.initialCount += 1;
        this.entityFormService.insertFormArrayGroup(
            this.initialCount, this.formArray, this.arrayControl.formarray);
      }
    },
    {
      id : 'remove_alias',
      name : 'Remove extra Alias',
      function : () => {
        this.initialCount -= 1;
        this.entityFormService.removeFormArrayGroup(this.initialCount, this.formArray);
      }
    }
  ];

  private int_v4netmaskbit: any;
  private int_v6netmaskbit: any;
  private int_alias_v4netmaskbit: any;
  private int_alias_v6netmaskbit: any;

  private int_interface: any;
  private entityForm: any;

  constructor(protected router: Router,
              protected route: ActivatedRoute,
              protected rest: RestService,
              protected networkService: NetworkService,
              protected entityFormService: EntityFormService) {}

  isCustActionVisible(actionId: string) {
    if (actionId == 'remove_alias' && this.initialCount <= 1) {
      return false;
    }
    return true;
  }

  preInit(entityForm: any) {
    this.int_interface = _.find(this.fieldConfig, {'name' : 'int_interface'});
    this.arrayControl = _.find(this.fieldConfig, {'name' : 'int_aliases'});
    this.route.params.subscribe(params => {
      if(!params['pk']) {
        this.int_interface.type = 'select';
        this.int_interface.options = [];
        this.arrayControl.initialCount = this.initialCount = this.initialCount_default = 1;
      }
    });
  }

  afterInit(entityForm: any) {
    this.formArray = entityForm.formGroup.controls['int_aliases'];

    this.int_v4netmaskbit =
        _.find(this.fieldConfig, {'name' : 'int_v4netmaskbit'});
    this.int_v4netmaskbit.options = this.networkService.getV4Netmasks();

    this.int_v6netmaskbit =
        _.find(this.fieldConfig, {'name' : 'int_v6netmaskbit'});
    this.int_v6netmaskbit.options = this.networkService.getV6PrefixLength();

    this.int_alias_v4netmaskbit =
        _.find(this.arrayControl.formarray, {'name' : 'int_alias_v4netmaskbit'});
    this.int_alias_v4netmaskbit.options = this.networkService.getV4Netmasks();

    this.int_alias_v6netmaskbit =
        _.find(this.arrayControl.formarray, {'name' : 'int_alias_v6netmaskbit'});
    this.int_alias_v6netmaskbit.options = this.networkService.getV6PrefixLength();
    
    if (!entityForm.isNew) {
      entityForm.setDisabled('int_interface', true);
    }
    else {
      this.networkService.getInterfaceNicChoices().subscribe((res) => {
        res.forEach((item) => {
          this.int_interface.options.push({label : item[1], value : item[0]});
        });
      });
    }
  }

  preHandler(data: any[]): any[] {
    type IPAddress = {
      int_alias_v4address: string,
      int_alias_v4netmaskbit: string,
      int_alias_v6address: string,
      int_alias_v6netmaskbit: string
    };
    let rs = [];
    console.log("=====", data);
    for (let i in data) {
      let item: IPAddress;
      var ip_arr: any[] = _.split(data[i], '/');
      var ip = ip_arr[0];
      var netmaskbit = ip_arr[1];

      if (IPV4_REGEXP.test(ip)) {
        item = {
          int_alias_v4address: ip, 
          int_alias_v4netmaskbit: netmaskbit, 
          int_alias_v6address: "", 
          int_alias_v6netmaskbit: ""};      
      }
      else {
        item = {
          int_alias_v4address: "", 
          int_alias_v4netmaskbit: "", 
          int_alias_v6address: ip, 
          int_alias_v6netmaskbit: netmaskbit
        };
      }
      rs.push(item);
    }
    console.log("re====", rs);
    return rs;
  }

  getIPv4IPv6s(data: any[]): any[] {
    let IPs = new Array();
    let alias_data = data['int_aliases'];

    for (let i in alias_data) {
      let ipv4 = "";
      let ipv6 = "";

      if ('int_alias_v4address' in alias_data[i] && 'int_alias_v4netmaskbit' in alias_data[i]) {
        if(alias_data[i]['int_alias_v4address'] || alias_data[i]['int_alias_v4netmaskbit']) {
          ipv4 = alias_data[i]['int_alias_v4address'] + '/' + alias_data[i]['int_alias_v4netmaskbit'];
          IPs.push(ipv4);
        }
      }

      if ('int_alias_v6address' in alias_data[i] && 'int_alias_v6netmaskbit' in alias_data[i]) {
        if(alias_data[i]['int_alias_v6address'] || alias_data[i]['int_alias_v6netmaskbit']) {
          ipv6 = alias_data[i]['int_alias_v6address'] + '/' + alias_data[i]['int_alias_v6netmaskbit'];
          IPs.push(ipv6);
        }        
      }     
    }
    return IPs;
  }

  beforeSubmit(value: any) {
    let IP_array = this.getIPv4IPv6s(value);
    value['int_aliases'] = [...IP_array];
  }
}
