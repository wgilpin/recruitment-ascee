
export default class TableStyles {
  static styles = {
    themeColor: { color: '#01799A' },
    table: {
      // paddingLeft: 12,
      display: 'table',
      width: '100%',
      // padding: '16px',
    },
    headerText: {
      fontWeight: 'bold',
      color: '#01799A',
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
    },
    nowrap: {
      whiteSpace: 'nowrap',
    },
    cell: {
      textAlign: 'left',
      display: 'table-cell',
      paddingLeft: '6px',
      paddingRight: '6px',
    },
    nonTableCell: {
      textAlign: 'left',
      padding: '6px',
    },
    isOdd: {
      backgroundColor: '#151515',
    },
    hr: {
      borderBottom: '1px solid blue',
      display: 'table-row',
      height: '2px',
    },
    folderHeader: {
      fontWeight: 'bold',
      textAlign: 'left',
      backgroundColor: '#05313E',
      paddingTop: '6px',
      paddingBottom: '6px',
    },
    isk: {
      fontSize: 'small',
      fontStyle: 'italic',
      right: '32px',
      position: 'absolute',
    },
    iskLeft: {
      fontSize: 'small',
      fontStyle: 'italic',
      right: '64px',
      position: 'absolute',
    }
  }
}
