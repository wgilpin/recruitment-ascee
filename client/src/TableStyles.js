
export default class TableStyles {
  static styles = {
  table: {
    // paddingLeft: 12,
    display: 'table',
    width: '100%',
    // padding: '16px',
  },
  header: {
    display: 'table-header-group',
    fontWeight: 'bold',
    paddingBottom: '19px',
    color: '#01799A',
  },
  body: {
    display: 'table-row-group',
  },
  row: {
    display: 'table-row',
    padding: '6px',
  },
  cell: {
    textAlign: 'left',
    display: 'table-cell',
    padding: '6px',
  },
  isOdd: {
    backgroundColor: '#151515',
  },
  hr:{
    borderBottom: '1px solid blue',
    display: 'table-row',
    height: '2px',
  },
  folderHeader: {
    fontWeight: 'bold',
    textAlign: 'left',
    backgroundColor: '#05313E',
  }
}
}
