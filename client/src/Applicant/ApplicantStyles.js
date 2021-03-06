import TableStyles from '../evidence/TableStyles';
import Styles from '../common/Styles';

const button = {
  fontSize: 'large',
  padding: '6px',
  margin: '12px',
  borderRadius: '3px',
  borderStyle: 'none',
  width: '200px'
}

const styles = {
  panel: {
    maxWidth: '600px',
    margin: '0 auto',
  },
  submit: {
    ...button,
    backgroundColor: TableStyles.styles.header.color,
  },
  padded: {
    padding: 6,
  },
  label: {
    textAlign: 'left',
    fontSize: 'large',
    marginBottom: '6px',
  },
  paddedHeavily: {
    padding: 24,
    maxWidth: '350px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  list: {
    textAlign: 'left',
  },
  tabHeader: {
    color: TableStyles.styles.header.color,
  },
  heading: {
    color: TableStyles.styles.header.color,
  },
  headingLeft: {
    color: TableStyles.styles.header.color,
    textAlign: 'left',
    paddingLeft: '12px',
  },
  answer: {
    width: '90%',
    height: '60px',
    padding: '6px',
    backgroundColor: '#222',
    color: 'white',
    border: 'none',
  },
  answerText: {
    minHeight: '60px',
    maxHeight: '160px',
    overflowY: 'auto',
    overflowX: 'hidden',
    backgroundColor: '#222',
    textAlign: 'left',
    padding: '6px',
  },
  hr: {
    borderColor: '#555555',
    borderWidth: '1px',
  },
  logo: {
    height: '60px',
    marginRight: '100px',
  },
  header: {
    margin: '0 auto',
    display: 'table',
    paddingBottom: '32px',
  },
  h1: {
    height: '60px',
    display: 'flex',
    alignItems: 'center',
  },
  alts: {
    backgroundColor: '#333',
    textAlign: 'left',
  },
  logout: {
    position: 'absolute',
    left: '12px',
    top: '12px',
  },
  checkbox: {
    transform: 'scale(1.5)'
  },
  primaryButton: {
    ...button,
    color: 'white',
    backgroundColor: Styles.themeColors.primary,
  },
  secondaryButton: {
    ...button,
    color: 'white',
    backgroundColor: Styles.themeColors.secondary,
  },
  disabledButton: {
    ...button,
    color: 'darkgrey',
    backgroundColor: Styles.themeColors.secondary,
  },
  themeColors: Styles.themeColors,
};

export default styles;
