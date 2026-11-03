import { Component, EventEmitter, Input, Output, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { MatBadge } from '@angular/material/badge';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatListOption, MatSelectionList } from '@angular/material/list';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { TranslationPipe, TranslationService } from '@angulartoolsdr/translation';
import { SafePipe } from '@angulartoolsdr/shared-utils';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'lib-selection-filter-data',
  templateUrl: './selection-filter-data.html',
  styleUrls: ['./selection-filter-data.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [MatIconButton, MatMenuTrigger, MatButton, MatBadge, MatMenu, MatDivider, MatSelectionList, MatListOption, FormsModule, TranslationPipe, SafePipe]
})
export class SelectionFilterData {

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
  @Input() disableClear = false;
  @Input() fieldHierarquico = '';
  @Input() fieldNivel = '';

  @Input('lista')
  set _lista(value) {
    this.sFiltro = '';
    value = value != null ? value : [];
    this.lista = value;
    const listaCompleta = [];
    this.lista.forEach(
      item => listaCompleta.push(item)
    );
    this.listaCompleta = listaCompleta;
    this.selecionados = this.listaCompleta.filter(x => x.selected);
    if (this.allSelectedDefault && this.lista != null && this.lista.length > 0) {
      this.checkSelectList(true);
      this.selecionados = Object.assign([], this.listaCompleta);
    } else if (this.lista?.length === 1 && this.onlySelectedDefault) {
      this.lista[0].selected = true;
      this.listaCompleta[0].selected = true;
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
    if (value != null && this.lista != null) {
      // Limpa a lista
      this.checkSelectList(false);

      // Seleciona o registro
      for (let i = 0; i < this.lista.length; i++) {
        if (this.lista[i][this.bindId] === value[this.bindId]) {
          this.lista[i].selected = true;
          const comp = this.listaCompleta.find(x => (x[this.bindId] ?? x.id) === (value[this.bindId] ?? value.id));
          if (comp) {
            comp.selected = true;
          }
          this.selecionados = [this.lista[i]];
          break;
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

  constructor(protected translate: TranslationService) { }

  openMenu() {
    if (this.trigger?.menuOpen) {
      this.preSelecionados = (this.listaCompleta || []).filter(x => x.selected).map(x => ({ ...x }));
    }
  }

  closeMenu() {
    this.trigger.closeMenu();
  }

  isAllSelected(): boolean {
    if (!this.lista || this.lista.length === 0) {
      return false;
    }
    return this.lista.every(x => x.selected);
  }

  selecionarTodos() {
    const todosSelecionados = this.isAllSelected();
    this.checkSelectList(!todosSelecionados);
    if (!this.showButtons) {
      this.onConfirm(false);
    }
  }

  selecionarItem(item, oldValue) {
    if (this.disabled) {
      return;
    }
    const novoValor = !oldValue;
    if (this.multiple) {
      item.selected = novoValor;
      const comp = this.listaCompleta.find(x => (x[this.bindId] ?? x.id) === (item[this.bindId] ?? item.id));
      if (comp) {
        comp.selected = novoValor;
      }
      this.selecionados = this.listaCompleta.filter(x => x.selected);
      if (!this.showButtons) {
        this.onConfirm(false);
      }
    } else {
      if (!this.disableClear && oldValue) {
        this.checkSelectList(false);
        item.selected = false;
        const comp = this.listaCompleta.find(x => (x[this.bindId] ?? x.id) === (item[this.bindId] ?? item.id));
        if (comp) {
          comp.selected = false;
        }
        this.selecionados = [];
      } else {
        this.checkSelectList(false);
        item.selected = true;
        const comp = this.listaCompleta.find(x => (x[this.bindId] ?? x.id) === (item[this.bindId] ?? item.id));
        if (comp) {
          comp.selected = true;
        }
        this.selecionados = [item];
      }
      if (!this.showButtons) {
        this.onConfirm(false);
      }
    }
  }

  ordernarLista() {
    this.lista = this.lista.sort((a, b) => (a[this.campo]?.toUpperCase() > b[this.campo]?.toUpperCase()) ? 1 : ((b[this.campo]?.toUpperCase() > a[this.campo]?.toUpperCase()) ? -1 : 0));

    const selecionadosDaLista = this.lista.filter(x => x.selected);
    if (selecionadosDaLista.length > 0) {
      let listaOrdenada = [...selecionadosDaLista];
      for (let i = 0; i < this.lista.length; i++) {
        if (!listaOrdenada.some(x => (x[this.bindId] ?? x.id) === (this.lista[i][this.bindId] ?? this.lista[i].id))) {
          listaOrdenada.push(this.lista[i]);
        }
      }
      this.lista = listaOrdenada;
    }
  }

  onConfirm(close = true) {
    if (this.multiple) {
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
    for (let i = 0; i < this.listaCompleta.length; i++) {
      this.listaCompleta[i].selected = false;
    }
    for (let i = 0; i < this.lista.length; i++) {
      this.lista[i].selected = false;
    }
    if (this.selectable != null) {
      this.selectable.deselectAll();
    }
    this.selecionados = [];
    this.loadList = false;
    setTimeout(() => {
      this.sFiltro = '';
      this.lista = this.listaCompleta;
      this.loadList = true;
    }, 300);
    this.selectedOptions.emit(this.multiple ? [] : null);
  }

  changeInput(event) {
    this.sFiltro = event?.target?.value;

    if (this.sFiltro != null && this.sFiltro !== '') {
      const filtroFormatado = this.removerAcento(this.sFiltro).toLowerCase();

      // 1. Encontra todos os itens que dão match direto com o texto digitado
      const itensComMatchDireto = this.listaCompleta?.filter(x =>
        this.checarValor(x[this.campo], filtroFormatado)
      ) || [];

      // 2. Cria um Set para armazenar os IDs de todos os itens válidos (matches + pais deles)
      const idsValidos = new Set();

      // Função auxiliar interna para subir na hierarquia adicionando os pais
      const mapearAncestrais = (item) => {
        if (!item) return;

        idsValidos.add(item[this.bindId] ?? item.id);

        if (this.fieldHierarquico && item[this.fieldHierarquico] != null) {
          const idPai = item[this.fieldHierarquico]?.[this.bindId] ?? item[this.fieldHierarquico]?.id ?? item[this.fieldHierarquico];
          const paiDoItem = this.listaCompleta.find(p => (p[this.bindId] ?? p.id) === idPai);
          if (paiDoItem) {
            mapearAncestrais(paiDoItem);
          }
        }
      };

      if (this.fieldHierarquico) {
        itensComMatchDireto.forEach(item => mapearAncestrais(item));
        this.lista = this.listaCompleta?.filter(x => idsValidos.has(x[this.bindId] ?? x.id));
      } else {
        this.lista = itensComMatchDireto;
      }
    } else {
      this.lista = this.listaCompleta;
    }
  }

  checarValor(valorCampo, filtroFormatado) {
    if (valorCampo == null) return false;

    if (typeof valorCampo === 'string') {
      if (valorCampo !== '') {
        const valorTraduzido = this.removerAcento(this.translate.instant(valorCampo)).toLowerCase();
        return valorTraduzido.indexOf(filtroFormatado) > -1;
      }
    } else {
      return valorCampo.toString().indexOf(filtroFormatado) > -1;
    }

    return false;
  }

  cancelar() {
    this.loadList = false;

    // Restaura o estado anterior a partir de preSelecionados
    const preIds = new Set((this.preSelecionados || []).map(x => (x[this.bindId] ?? x.id)));
    for (let j = 0; j < this.listaCompleta.length; j++) {
      this.listaCompleta[j].selected = preIds.has(this.listaCompleta[j][this.bindId] ?? this.listaCompleta[j].id);
    }
    this.sFiltro = '';
    this.lista = this.listaCompleta;
    this.selecionados = this.listaCompleta.filter(x => x.selected);

    setTimeout(() => {
      this.loadList = true;
    }, 300);

    this.closeMenu();
  }

  checkSelectList(value) {
    if (!value && !this.sFiltro) {
      for (let i = 0; i < this.listaCompleta.length; i++) {
        this.listaCompleta[i].selected = false;
      }
    }
    for (let i = 0; i < this.lista.length; i++) {
      this.lista[i].selected = value;
      const comp = this.listaCompleta.find(x => (x[this.bindId] ?? x.id) === (this.lista[i][this.bindId] ?? this.lista[i].id));
      if (comp) {
        comp.selected = value;
      }
    }
    if (this.selectable != null) {
      if (value) {
        this.selectable.selectAll();
      } else {
        this.selectable.deselectAll();
      }
    }
    this.selecionados = this.listaCompleta.filter(x => x.selected);
  }

  removerAcento(str) {
    const comAcento = 'ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝŔÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿŕ';
    const semAcento = 'AAAAAAACEEEEIIIIDNOOOOOOUUUUYRsBaaaaaaaceeeeiiiionoooooouuuuybyr';

    let novastr = '';
    for (let i = 0; i < str.length; i++) {
      let troca = false;
      for (let a = 0; a < comAcento.length; a++) {
        if (str.substr(i, 1) === comAcento.substr(a, 1)) {
          novastr += semAcento.substr(a, 1);
          troca = true;
          break;
        }
      }
      if (!troca) {
        novastr += str.substr(i, 1);
      }
    }
    return novastr;
  }
}
