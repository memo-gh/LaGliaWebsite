export const TRANSLATIONS = {
  it: {
    loading: {
      ariaLabel: 'Caricamento in corso',
      caption: 'giusto qualche secondo...',
    },
    hero: {
      conjunction: 'e',
      languageSelectorAria: 'Seleziona lingua',
    },
    menuWheel: {
      ariaLabel: 'Ruota di navigazione',
      items: {
        contattaci: 'Contattaci',
        vini: 'Vini',
        territorio: 'Territorio',
        azienda: 'Azienda',
      },
    },
    terroir: {
      title: 'Territorio',
      subtitleLine1:
        'Scopri il territorio della valle del Casentino dove nascono e',
      subtitleLine2: 'maturano i nostri prodotti',
      learnMore: 'Scopri di più',
      showLess: 'Mostra meno',
      showDetailsAria: (title) => `Mostra dettagli ${title}`,
      items: {
        terreno: {
          title: 'Terreno',
          detailText:
            'Suolo franco-argilloso ricco di scheletro minerale a 350m s.l.m., ideale per conferire struttura, sapidità ed eleganza alle radici.',
        },
        clima: {
          title: 'Clima',
          detailText:
            'Microclima preappenninico caratterizzato da forti escursioni termiche tra il giorno e la notte che esaltano i profumi varietali.',
        },
        vigna: {
          title: 'Vigna',
          detailText:
            'Filari esposti a Sud-Ovest nella valle del Casentino, accarezzati dalla brezza costante e coltivati nel pieno rispetto dei cicli naturali.',
        },
      },
    },
    company: {
      title: 'L’Azienda',
      subtitle: 'E i l suo team',
      prevCardAria: 'Scheda precedente',
      nextCardAria: 'Scheda successiva',
      slideIndicatorAria: 'Indicatore diapositive',
      slideAria: (idx) => `Diapositiva ${idx}`,
    },
    wine: {
      sectionTitle: 'I Nostri Vini',
      merlotTitle: 'Il Merlot',
      comingSoonTitle: 'Prossimamente',
      inCellarBadge: 'In Cantina',
      inDetailBtn: 'In Dettaglio',
      comingSoonLines: [
        'Un nuovo capitolo della nostra cantina',
        'sta maturando lentamente in botte.',
        'Curiamo ogni dettaglio con dedizione',
        'per offrirvi un vino dal carattere autentico.',
        'Il tempo e il terroir stanno compiendo',
        'la loro magia silenziosa.',
        'Presto disponibile per la degustazione',
        'e la scoperta in anteprima.',
      ],
      specs: {
        merlot: {
          alcohol: '13% vol.',
          grape: 'Solo Merlot',
          pairing: 'Cazzi e Mazzi',
        },
        comingSoon: {
          alcohol: '? % vol.',
          grape: 'In Affinamento',
          pairing: 'Prossimamente',
        },
      },
      priceMerlot: 'prezzo: 24,00 €',
      priceComingSoon: 'prezzo: —',
      detailsTitle: 'I Dettagli',
      detailsRegionAria: 'I Dettagli del vino',
      categoryLabel: 'CATEGORIA',
      vinificationLabel: 'VINIFICAZIONE',
      buyBtn: 'Acquista',
      prevWineAria: 'Vino precedente',
      nextWineAria: 'Prossimo vino in arrivo',
      merlotBottleAlt: 'Bottiglia Il Merlot 2023',
      comingSoonBottleAlt: 'Prossimo vino in arrivo',
    },
    footer: {
      estateHeader: 'TENUTA',
      countryLine: '52014 Poppi AR - Italia',
      contactsHeader: 'CONTATTI',
      linksHeader: 'LINKS',
    },
    scrollToTop: {
      label: 'Torna su',
    },
  },
  en: {
    loading: {
      ariaLabel: 'Loading',
      caption: 'just a few seconds...',
    },
    hero: {
      conjunction: '&',
      languageSelectorAria: 'Select language',
    },
    menuWheel: {
      ariaLabel: 'Navigation wheel',
      items: {
        contattaci: 'Contact Us',
        vini: 'Wines',
        territorio: 'Terroir',
        azienda: 'The Estate',
      },
    },
    terroir: {
      title: 'Terroir',
      subtitleLine1:
        'Discover the terroir of the Casentino valley where our',
      subtitleLine2: 'products are born and mature',
      learnMore: 'Learn more',
      showLess: 'Show less',
      showDetailsAria: (title) => `Show ${title} details`,
      items: {
        terreno: {
          title: 'Soil',
          detailText:
            'Clay-loam soil rich in mineral skeleton at 350m a.s.l., ideal for imparting structure, sapidity, and elegance to the roots.',
        },
        clima: {
          title: 'Climate',
          detailText:
            'Pre-Apennine microclimate characterized by strong day-night temperature swings that enhance varietal aromas.',
        },
        vigna: {
          title: 'Vineyard',
          detailText:
            'Southwest-facing rows in the Casentino valley, caressed by a constant breeze and cultivated in full respect of natural cycles.',
        },
      },
    },
    company: {
      title: 'The Estate',
      subtitle: 'A n d its team',
      prevCardAria: 'Previous card',
      nextCardAria: 'Next card',
      slideIndicatorAria: 'Slide indicator',
      slideAria: (idx) => `Slide ${idx}`,
    },
    wine: {
      sectionTitle: 'Our Wines',
      merlotTitle: 'Il Merlot',
      comingSoonTitle: 'Coming Soon',
      inCellarBadge: 'In the Cellar',
      inDetailBtn: 'In Detail',
      comingSoonLines: [
        'A new chapter of our cellar',
        'is slowly maturing in oak barrels.',
        'We tend to every detail with dedication',
        'to offer a wine of authentic character.',
        'Time and terroir are working',
        'their silent magic.',
        'Soon available for tasting',
        'and exclusive preview discovery.',
      ],
      specs: {
        merlot: {
          alcohol: '13% vol.',
          grape: 'Merlot Only',
          pairing: 'Odds & Ends',
        },
        comingSoon: {
          alcohol: '? % vol.',
          grape: 'Barrel Aging',
          pairing: 'Coming Soon',
        },
      },
      priceMerlot: 'price: 24.00 €',
      priceComingSoon: 'price: —',
      detailsTitle: 'The Details',
      detailsRegionAria: 'Wine details',
      categoryLabel: 'CATEGORY',
      vinificationLabel: 'VINIFICATION',
      buyBtn: 'Buy Now',
      prevWineAria: 'Previous wine',
      nextWineAria: 'Upcoming wine coming soon',
      merlotBottleAlt: 'Il Merlot 2023 bottle',
      comingSoonBottleAlt: 'Upcoming wine coming soon',
    },
    footer: {
      estateHeader: 'ESTATE',
      countryLine: '52014 Poppi AR - Italy',
      contactsHeader: 'CONTACTS',
      linksHeader: 'LINKS',
    },
    scrollToTop: {
      label: 'Back to top',
    },
  },
}
