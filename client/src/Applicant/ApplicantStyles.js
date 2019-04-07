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
    width: '300px',
    height: '60px',
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
    marginLeft: 'auto',
    marginRight: 'auto',
    width: 'fit-content',
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
