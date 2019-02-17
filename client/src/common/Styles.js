export default class Styles {

  static themeColors = {
    primary: '#01799A',
    secondary: '#333',
  };

  static button = {
    fontSize: 'large',
    padding: '6px',
    margin: '12px',
    borderRadius: '3px',
    borderStyle: 'none',
    width: '200px'
  }
  static styles = {
    primaryButton: {
      ...Styles.button,
      color: 'white',
      backgroundColor: Styles.themeColors.primary,
    },
    secondaryButton: {
      ...Styles.button,
      colour: Styles.themeColors.primary,
      backgroundColor: Styles.themeColors.secondary,
      borderColor: Styles.themeColors.primary,
    },
    smallPrimary: {
      ...Styles.button,
      color: 'white',
      width: '70px',
      backgroundColor: Styles.themeColors.primary,
    },
    smallSecondary: {
      ...Styles.button,
      width: '70px',
      colour: Styles.themeColors.primary,
      backgroundColor: Styles.themeColors.secondary,
      borderColor: Styles.themeColors.primary,
    },
    link: {
      color: Styles.themeColors.primary,
    },
    linkButton : {
      color: Styles.themeColors.primary,
      border: 'none',
      backgroundColor: '#0000',
      cursor: 'pointer',
      fontSize: 'large',
      textDecorationStyle: 'underline'
    }
  }
}

