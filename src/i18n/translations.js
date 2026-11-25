export const TRANSLATIONS = {
  it: {
    loading: {
      ariaLabel: 'Caricamento in corso',
      caption: 'giusto qualche secondo...',
      ageQuestion: 'Hai più di 18 anni?',
      ageYes: 'Sì',
      ageNo: 'No',
      underageMessage:
        'Ci dispiace, devi avere almeno 18 anni per accedere al sito.',
    },
    hero: {
      line1: 'Tra Scienza',
      conjunction: 'e',
      line2End: 'Design',
      languageSelectorAria: 'Seleziona lingua',
    },
    menuWheel: {
      ariaLabel: 'Ruota di navigazione',
      items: {
        contattaci: 'Contattaci',
        vini: 'Vini',
        territorio: 'Territorio',
        azienda: 'Azienda',
        eventi: 'Eventi',
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
      subtitle: 'E il suo team',
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
    events: {
      conjunction: 'e',
      title: 'le nostre esperienze',
      subtitleLine1:
        "A La Glia diamo molto valore all'esperienza, molto più che al",
      subtitleLine2: 'valore del prodotto in sé.',
      cards: {
        cellar: {
          title: 'Visita la Cantina',
          bullets: ['lorem ipsum', 'lorem ipsum', 'lorem ipsum'],
          people: '1-10 persone',
          price: '20€ cad.',
          languages: 'lingue IT | EN',
        },
        tasting: {
          title: 'Degustazioni',
          bullets: ['lorem ipsum', 'lorem ipsum', 'lorem ipsum'],
          people: '2-8 persone',
          price: '25€ cad.',
          languages: 'lingue IT | EN',
        },
      },
      bottomTextLine1: 'lorem ipsum dolor sit amet,',
      bottomTextLine2: 'sbabolli galoppi cartani',
      bookBtn: 'Prenota',
      videoFocusHint: 'Clicca per vedere solo il video',
      videoRestoreHint: 'Clicca per mostrare i contenuti',
    },
    footer: {
      estateHeader: 'TENUTA',
      countryLine: '52014 Poppi AR - Italia',
      contactsHeader: 'CONTATTI',
      linksHeader: 'LINKS',
      openMaps: 'Apri su Google Maps',
      closePopupAria: 'Chiudi finestra',
    },
    scrollToTop: {
      label: 'Torna su',
    },
    wip: {
      titleLine1: 'Ci Scusiamo per il disagio!',
      titleLine2: 'Questa pagina è ancora in costruzione',
      bodyLine1: 'Per ordini o prenotazioni vi preghiamo di contattarci',
      bodyLine2Prefix: 'via mail a ',
      bodyLine3Prefix: 'oppure con un messaggio a ',
      closeBtn: 'CHIUDI',
    },
  },
  en: {
    loading: {
      ariaLabel: 'Loading',
      caption: 'just a few seconds...',
      ageQuestion: 'Are you over 18?',
      ageYes: 'Yes',
      ageNo: 'No',
      underageMessage:
        'Sorry, you must be at least 18 years old to enter this site.',
    },
    hero: {
      line1: 'Science',
      conjunction: 'meets',
      line2End: 'Design',
      languageSelectorAria: 'Select language',
    },
    menuWheel: {
      ariaLabel: 'Navigation wheel',
      items: {
        contattaci: 'Contact Us',
        vini: 'Wines',
        territorio: 'Terroir',
        azienda: 'The Estate',
        eventi: 'Events',
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
      subtitle: 'And its team',
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
    events: {
      conjunction: '&',
      title: 'our experiences',
      subtitleLine1:
        'At La Glia we place great value on the experience, far more than on',
      subtitleLine2: 'the value of the product itself.',
      cards: {
        cellar: {
          title: 'Cellar Tour',
          bullets: ['lorem ipsum', 'lorem ipsum', 'lorem ipsum'],
          people: '1-10 guests',
          price: '20€ ea.',
          languages: 'lang IT | EN',
        },
        tasting: {
          title: 'Wine Tastings',
          bullets: ['lorem ipsum', 'lorem ipsum', 'lorem ipsum'],
          people: '2-8 guests',
          price: '25€ ea.',
          languages: 'lang IT | EN',
        },
      },
      bottomTextLine1: 'lorem ipsum dolor sit amet,',
      bottomTextLine2: 'sbabolli galoppi cartani',
      bookBtn: 'Book Now',
      videoFocusHint: 'Click to view video only',
      videoRestoreHint: 'Click to show content',
    },
    footer: {
      estateHeader: 'ESTATE',
      countryLine: '52014 Poppi AR - Italy',
      contactsHeader: 'CONTACTS',
      linksHeader: 'LINKS',
      openMaps: 'Open in Google Maps',
      closePopupAria: 'Close popup',
    },
    scrollToTop: {
      label: 'Back to top',
    },
    wip: {
      titleLine1: 'We apologize for the inconvenience!',
      titleLine2: 'This page is still under construction',
      bodyLine1: 'For orders or bookings please contact us',
      bodyLine2Prefix: 'by email at ',
      bodyLine3Prefix: 'or with a message to ',
      closeBtn: 'CLOSE',
    },
  },
}
