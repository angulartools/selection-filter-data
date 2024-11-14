import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MatBadge } from '@angular/material/badge';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatListOption, MatSelectionList } from '@angular/material/list';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SafePipe } from '@angulartoolsdr/shared-utils';

@Component({
  selector: 'lib-selection-filter-data',
  templateUrl: './selection-filter-data.component.html',
    styleUrls: ['./selection-filter-data.component.css'],
    standalone: true,
    imports: [TranslateModule, MatIconButton, MatMenuTrigger, MatButton, MatBadge, MatIcon, MatMenu, MatDivider, MatSelectionList, MatListOption, TranslateModule, SafePipe]
})
export class SelectionFilterDataComponent {
  @Input() width = 'inherit';
  @Input() height = '300px';
  @Input() label = null;
  @Input() campo = 'nome';
  @Input() returnObject = true;
  @Input() ordenarSelecionados = false;
  @Input() showButtons = true;
  @Input() allSelectedDefault = false;
  @Input() onlySelectedDefault = false;
  @Input() maxMultipleSelected = 100;
  @Input() multiple = true;
  @Input() disabled = false;
  @Input() bindId = 'id';
  @Input() filtroSelecionado = null;
  @Input() disableClear = false;

  @Input('lista')
  set _lista(value) {
    this.sFiltro = '';
    value = value !== null && value !== undefined ? value : [];
    this.lista = value;
    const listaCompleta = [];
    this.lista.forEach(
      item => listaCompleta.push(item)
    );
    this.listaCompleta = listaCompleta;
    this.selecionados = [];
    if (this.allSelectedDefault && this.lista !== undefined && this.lista.length > 0) {
      this.checkSelectList(true);
      if (this.returnObject) {
        this.selecionados = Object.assign([], this.lista);
      } else {
        this.selecionados = Object.assign([], this.lista.map(x => x[this.campo]));
      }
    } else if (this.lista?.length === 1 && this.onlySelectedDefault) {
      this.lista[0].selected = true;
      this.selecionados = Object.assign([], this.lista);
      if (!this.returnObject) {
        this.selectedOptions.emit(this.selecionados[0][this.campo]);
      } else {
        this.selectedOptions.emit(this.selecionados[0]);
      }
    }
    this.loadList = true;
  }

  // Apenas um registro
  @Input('filtroSelecionado')
  set _filtroSelecionado(value) {
    if (value !== null && value !== undefined) {
      if (this.lista !== undefined && this.lista !== null) {

        // Limpa a lista
        this.checkSelectList(false);

        // Seleciona o registro
        for (let i = 0; i < this.lista.length; i++) {
          if (this.lista[i][this.bindId] === value[this.bindId]) {
            this.lista[i].selected = true;
            this.selecionados = [this.lista[i]];
            break;
          }
        }
      }
    }
  }

  sFiltro = '';
  preSelecionados;
  loadList = false;
  selecionados = [];
  lista = [];
  listaCompleta = [];

  @Output() selectedOptions: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('selectable') selectable: MatSelectionList;
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;

  constructor(protected translate: TranslateService){}

  openMenu() {
    if (this.trigger.menuOpen) {
      this.preSelecionados = this.lista?.filter(x => x.selected);
    }
  }

  closeMenu() {
    this.trigger.closeMenu();
  }

  selecionarTodos() {
    if (this.selectable.selectedOptions.selected.length < this.lista.length) {
      this.checkSelectList(true);
    } else {
      this.checkSelectList(false);
    }
    if (!this.showButtons) {
      this.onConfirm();
    }
  }

  selecionarItem(item, oldValue) {
    if (this.disabled) {
      return;
    }
    if(!this.showButtons) {
      if (!this.multiple && !this.disableClear) {
        this.checkSelectList(false);
        if (oldValue) {
          item.selected = false;
          this.selecionados = [];
        } else {
          item.selected = true;
          this.selecionados = [item];
        }
      } else if (this.disableClear) {
        item.selected = true;
        this.selecionados = [item];
      }
      this.onConfirm(false);
    }
  }

  ordernarLista() {
    this.lista = this.lista.sort((a,b) => (a[this.campo].toUpperCase() > b[this.campo].toUpperCase()) ? 1 : ((b[this.campo].toUpperCase() > a[this.campo].toUpperCase()) ? -1 : 0))

    if (this.selectable.selectedOptions.selected.length > 0) {
      let listaOrdenada = this.selectable.selectedOptions.selected.map(x => x.value);
      listaOrdenada = listaOrdenada.sort((a,b) => (a[this.campo].toUpperCase() > b[this.campo].toUpperCase()) ? 1 : ((b[this.campo].toUpperCase() > a[this.campo].toUpperCase()) ? -1 : 0))


      for(let i=0; i<this.lista.length; i++) {
        if (listaOrdenada.findIndex(x => x[this.campo] === this.lista[i][this.campo]) === -1) {
          listaOrdenada.push(this.lista[i]);
        }
      }
      this.lista = Object.assign([], listaOrdenada);
    }
  }

  onConfirm(close = true) {
    if (this.multiple) {
      // Limpa selecao
      for (let j = 0; j < this.lista.length; j++) {
        this.lista[j].selected = false;
      }
      for (let j = 0; j < this.listaCompleta.length; j++) {
        this.listaCompleta[j].selected = false;
      }
      const aSelecao = this.selectable.selectedOptions.selected.map(x => x.value[this.campo]);
      for (let i = 0; i < aSelecao.length; i++ ) {
        for (let j = 0; j < this.lista.length; j++) {
          if (this.lista[j][this.campo] === aSelecao[i]) {
            this.lista[j].selected = true;
          }
        }
        for (let j = 0; j < this.listaCompleta.length; j++) {
          if (this.listaCompleta[j][this.campo] === aSelecao[i]) {
            this.listaCompleta[j].selected = true;
          }
        }
      }
      this.lista = Object.assign([], this.lista);
      this.selecionados = this.listaCompleta.filter(x => x.selected);
    }
    if (this.ordenarSelecionados) {
      this.ordernarLista();
    }
    if (close) {
      this.closeMenu();
    }
    if (!this.returnObject) {
      this.selectedOptions.emit(this.multiple ? this.selecionados.map(x => x[this.campo]) : (this.selecionados.length > 0 ? this.selecionados[0][this.campo] : null));
    } else {
      this.selectedOptions.emit(this.multiple ? this.selecionados : (this.selecionados.length > 0 ? this.selecionados[0] : null));
    }
  }

  limparSelecao() {
    this.selecionados = [];
    if (this.selectable.selectedOptions.selected.length > 0) {
      this.checkSelectList(false);
    }
    this.loadList = false;
    setTimeout(() => {
      this.sFiltro = '';
      this.lista = this.listaCompleta;
      this.loadList = true
    }, 300)
    this.selectedOptions.emit(this.multiple ? [] : null);
  }

  changeInput(event) {
    this.sFiltro = event?.target?.value;
    if (this.sFiltro !== null && this.sFiltro !== undefined && this.sFiltro !== '') {
      this.lista = this.listaCompleta?.filter(x => {
        if (typeof x[this.campo] === 'string') {
          if (x[this.campo] !== '') {
            return this.removerAcento(this.translate.instant(x[this.campo])).toLowerCase().indexOf(this.removerAcento(this.sFiltro).toLowerCase()) > -1
          }
        } else {
          if (x[this.campo] !== null) {
            return x[this.campo].toString().indexOf(this.sFiltro) > -1
          }
        }
        return null;
      });
    } else {
      this.lista = this.listaCompleta;
    }
  }

  cancelar() {
    this.loadList = false;

    // Limpa a lista
    this.checkSelectList(false);

    // Seleciona os registros
    let selecionados = [];
    for (let i = 0; i < this.preSelecionados.length; i++) {
      for (let j = 0; j < this.lista.length; j++) {
        if (this.lista[j][this.campo] === this.preSelecionados[i][this.campo]) {
          this.lista[j].selected = true;
          selecionados.push(this.lista[j]);
          break;
        }
      }
    }

    this.selecionados = selecionados;
    this.lista = Object.assign([], this.lista);

    setTimeout(() => {
      this.loadList = true
    }, 300)


    this.closeMenu();
  }

  checkSelectList(value) {
    if (!value) {
      for (let i = 0; i < this.listaCompleta.length; i++) {
        this.listaCompleta[i].selected = value;
      }
    }
    for (let i = 0; i < this.lista.length; i++) {
      this.lista[i].selected = value;
    }
    if (this.selectable !== null && this.selectable !== undefined) {
      if (value) {
        this.selectable.selectAll();
      } else {
        this.selectable.deselectAll();
      }
    }
  }

  removerAcento(str) {
    const comAcento = 'ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝŔÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿŕ';
    const semAcento = 'AAAAAAACEEEEIIIIDNOOOOOOUUUUYRsBaaaaaaaceeeeiiiionoooooouuuuybyr';

    let novastr = '';
    for(let i=0; i<str.length; i++) {
      let troca=false;
      for (let a=0; a < comAcento.length; a++) {
        if (str.substr(i,1) === comAcento.substr(a,1)) {
          novastr += semAcento.substr(a,1);
          troca=true;
          break;
        }
      }
      if (!troca) {
        novastr+=str.substr(i,1);
      }
    }
    return novastr;
  }
}
