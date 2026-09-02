# Brief maquette — Landing page Jhon Doe VTC

Document à transmettre au webdesigner pour la création de la maquette. Décrit chaque section
de la page, dans l'ordre d'affichage : objectif, contenu réel (textes, listes, données),
éléments interactifs et CTA.

> Les choix de couleurs/typographies ne sont pas prescrits ici — la direction artistique reste
> libre pour le designer, dans l'esprit demandé ci-dessous.

## Cadrage

| | |
|---|---|
| **Objectif n°1** | Déclencher l'appel téléphonique |
| **Objectifs secondaires** | WhatsApp, puis formulaire |
| **Ton** | Professionnel, fiable, business |
| **Priorité device** | Mobile-first |

**Ton du contenu :** réassurance par la sérénité et l'efficacité — pas par la chaleur ou la
familiarité. Éviter les tournures « copines », les emojis décoratifs excessifs et le
vocabulaire trop informel dans la maquette.

## Hiérarchie des CTA (constante sur toute la page)

1. **Appel** — toujours le bouton le plus visible, dans chaque section.
2. **WhatsApp** — bouton secondaire, moins appuyé (contour plutôt que rempli).
3. **Formulaire** — accessible mais en dernier recours, uniquement en section Contact.

## Sommaire

- [En-tête (global)](#en-tête-global)
- [01 — Hero + simulateur d'itinéraire](#01--hero--simulateur-ditinéraire)
- [02 — Tarifs aéroport](#02--tarifs-aéroport-prix-fixes)
- [03 — Réserver en direct](#03--réserver-en-direct-engagements)
- [04 — Services](#04--services)
- [05 — Zones & gares desservies](#05--zones--gares-desservies)
- [06 — À propos + véhicule](#06--à-propos--véhicule)
- [07 — Avis clients](#07--avis-clients)
- [08 — Contact / Réservation](#08--contact--réservation)
- [Footer (global)](#footer-global)
- [Bouton d'appel flottant (mobile)](#bouton-dappel-flottant-mobile)
- [Notes transverses](#notes-transverses)

---

## En-tête (global)

*Statique · persistant sur toute la page (sticky au scroll)*

Barre fine et sobre. Rappelle le nom et donne un accès direct à l'appel sur desktop.

**Contenu :**
- **Nom de l'entreprise** — « Jhon Doe VTC » (texte seul pour l'instant, pas de logo fourni —
  un wordmark/logo peut être proposé par le designer).
- **Bouton d'appel** visible uniquement à partir du format tablette/desktop (sur mobile,
  l'appel est porté par le bouton flottant en bas d'écran — éviter la redondance).

**CTA :** Appeler : [téléphone] *(desktop/tablette uniquement)*

---

## 01 — Hero + simulateur d'itinéraire

*Interactif · élément central de la page*

**Élément le plus important de la page.** Doit convaincre en quelques secondes (accroche +
promesse) et donner immédiatement envie de tester le simulateur, principal levier
d'engagement avant l'appel.

**Accroche (au-dessus du titre) :**
> Chauffeur privé VTC — L'Haÿ-les-Roses & toute l'Île-de-France

**Titre principal — seul `<h1>` de la page :**
> Votre chauffeur VTC en Île-de-France, 24h/24 et 7j/7

**Texte d'introduction :**
> Réservation immédiate ou anticipée, transferts aéroports à prix fixe, trajets affaires,
> gares et longue distance. Un chauffeur privé ponctuel et discret, disponible jour et nuit,
> week-ends et jours fériés, pour des déplacements sans stress dans tout l'Île-de-France.

### Simulateur d'itinéraire — comportement à maquetter

1. **Texte d'aide** — « Indiquez votre point de départ et votre destination : l'itinéraire, la
   distance et la durée s'affichent instantanément. Pour un transfert aéroport, le tarif est
   fixe et connu d'avance. Pour tout autre trajet, confirmez votre tarif en un appel — sans
   engagement. »
2. **Deux champs adresse** avec autocomplétion — « Départ » et « Destination », côte à côte
   sur desktop, empilés sur mobile.
3. **Bouton** « Calculer l'itinéraire » — pleine largeur sur mobile, état de chargement
   « Calcul en cours… ».
4. **Carte interactive** — affiche le tracé une fois le calcul fait. Prévoir un état vide
   (avant calcul) et un état rempli (tracé + points départ/arrivée). La carte ne doit jamais
   piéger le scroll mobile.
5. **Résultat** — « Distance : X km · Durée estimée : Y min · Tarif fixe / Estimation : Z € »
   suivi d'une phrase de contexte (tarif fixe garanti pour un aéroport, ou estimation à
   confirmer par appel), puis CTA appel/WhatsApp.
6. **État d'erreur** — « Le calcul d'itinéraire est momentanément indisponible. Appelez pour
   connaître votre tarif. » + bouton d'appel.

**CTA du hero :**
- Appeler pour réserver — [téléphone] *(principal)*
- Réserver par WhatsApp *(secondaire)*
- Micro-réassurance sous les boutons : « Réponse rapide · Tarifs aéroport fixes · Chauffeur
  ponctuel »

---

## 02 — Tarifs aéroport (prix fixes)

*Statique · tableau*

Lever le frein n°1 des trajets aéroport : l'incertitude du prix. Le tableau doit être très
lisible, presque « ticket de caisse ».

**Titre :** Transferts aéroport à prix fixe, sans mauvaise surprise

> Fini les tarifs qui grimpent aux heures de pointe. Au départ de Paris et de la proche
> banlieue, vos transferts vers et depuis les aéroports parisiens sont facturés à un prix
> fixe, connu à l'avance, quelle que soit l'heure — y compris la nuit, le week-end et les
> jours fériés.

| Aéroport | Tarif fixe (Paris & proche banlieue) |
|---|---|
| Paris-Orly | 50 € |
| Paris-Charles de Gaulle (Roissy) | 65 € |
| Paris-Beauvais | 120 € |

Note sous le tableau : « Suivi des vols et prise en charge ponctuelle à l'arrivée comme au
départ. Tarif sur devis au-delà de la proche banlieue. »

**CTA :** Réservez votre transfert aéroport — [téléphone]

---

## 03 — Réserver en direct (engagements)

*Statique · argumentaire, 5 cartes*

Différencier d'une appli VTC classique : ici, on parle à un chauffeur, pas à un algorithme.

**Titre :** Réservez en direct avec votre chauffeur

> En réservant directement, vous parlez à votre chauffeur — pas à un algorithme. Un seul
> interlocuteur, un tarif stable et un service pensé pour votre tranquillité.

**5 cartes d'arguments :**
- **Tarif transparent, sans majoration dynamique** — le prix ne s'envole pas selon la demande.
- **Un interlocuteur unique** — vous joignez directement Jhon Doe, avant, pendant et après
  votre trajet.
- **La ponctualité comme règle d'or** — anticipation des horaires et suivi des vols pour des
  départs sereins.
- **Disponible 24h/24, 7j/7 et jours fériés** — un dernier train manqué, un vol de nuit, un
  imprévu : votre chauffeur répond.
- **Un véhicule dédié, soigné et confortable** — vous voyagez dans les meilleures conditions.

**CTA :** Appelez maintenant pour réserver — [téléphone]

---

## 04 — Services

*Statique · grille de 6 cartes*

Balayer tous les cas d'usage pour que chaque visiteur se reconnaisse dans un motif de trajet.

**Titre :** Des trajets de qualité, pour chaque besoin

- **Réservation immédiate ou anticipée** — Un besoin urgent ou un déplacement planifié :
  réservez en quelques secondes par téléphone ou WhatsApp, à toute heure.
- **Transferts aéroports** — Orly, Roissy-Charles de Gaulle et Beauvais à prix fixe, avec
  suivi des vols et prise en charge ponctuelle.
- **Transferts gares** — Gares parisiennes, Massy-Palaiseau, Marne-la-Vallée Chessy et gare
  TGV Roissy-CDG. Sans stress de correspondance.
- **Déplacements affaires** — Ponctualité, discrétion et confort pour vos rendez-vous
  professionnels en Île-de-France.
- **Longue distance & province** — Au-delà de l'Île-de-France, votre chauffeur vous
  accompagne partout en France.
- **Disponibilité 24h/24 & 7j/7** — Jour et nuit, week-ends et jours fériés : le service ne
  s'arrête jamais.

**CTA :** Un trajet en tête ? Appelez le [téléphone]

---

## 05 — Zones & gares desservies

*Statique · texte + liste*

Rassurer sur la couverture géographique. Un visuel de carte (illustrative, non fonctionnelle)
de l'Île-de-France peut être envisagé ici par le designer.

**Titre :** Une couverture complète, de L'Haÿ-les-Roses à toute la France

> Basé à L'Haÿ-les-Roses (Val-de-Marne), votre chauffeur VTC intervient dans toute
> l'Île-de-France — Paris et l'ensemble des départements franciliens — ainsi que sur les
> trajets longue distance en province. Aucune destination n'est trop loin, aucune heure n'est
> trop tardive.

**Gares desservies :**
- Gares de Paris (Gare de Lyon, Montparnasse, Nord, Est, Saint-Lazare, Austerlitz…)
- Massy-Palaiseau
- Marne-la-Vallée Chessy ⚠️ *intitulé exact à confirmer avec le client*
- Gare TGV de l'aéroport Roissy-Charles de Gaulle

**CTA :** Votre adresse est-elle desservie ? Vérifiez en un appel — [téléphone]

---

## 06 — À propos + véhicule

*Statique · texte + image à intégrer*

Humaniser sans casser le ton business : présenter le chauffeur et le véhicule comme des gages
de fiabilité, pas comme une histoire personnelle.

**Titre :** Jhon Doe, votre chauffeur privé depuis 4 ans

> Chauffeur VTC professionnel depuis 4 ans, je me consacre à une seule mission : vous offrir
> une expérience de trajet irréprochable. Passionné par l'excellence du service, j'accorde une
> attention particulière à chaque client et à chaque détail. La ponctualité est ma règle d'or :
> elle garantit des déplacements sans stress, en toute sérénité.

**Sous-bloc « Votre véhicule »** ⚠️ *photo à prévoir* :

> Vous voyagez à bord d'une Kia Niro hybride gris foncé, récente, spacieuse et impeccablement
> entretenue. Un véhicule hybride à faibles émissions, silencieux et confortable.

Aucune photo réelle n'est encore disponible — prévoir un espace image (véhicule) avec alt
descriptif type « Kia Niro hybride gris foncé, chauffeur VTC Île-de-France ». Ne pas utiliser
de photo de stock qui ne correspond pas au vrai véhicule.

**Informations pratiques :**
- **Langue** — Français
- **Paiement** — Espèces à bord
- **Disponibilité** — 24h/24, 7j/7, jours fériés

**CTA :** Réservez votre chauffeur — [téléphone]

---

## 07 — Avis clients

*Statique · témoignages, 4 cartes*

Preuve sociale. Concevoir la carte de témoignage ; le contenu réel (avis Google) remplacera
les textes fictifs avant mise en ligne — inutile de maquetter un bandeau d'avertissement.

**Titre :** Ils ont choisi la sérénité

⚠️ *Avis fictifs — exemples de longueur uniquement.*

- « Chauffeur ponctuel et très professionnel. Il m'attendait à l'aéroport malgré un vol
  retardé, tarif exactement celui annoncé. » — **Marc D.**
- « Réservation simple par téléphone, véhicule propre et confortable, conduite souple. Parfait
  pour mes rendez-vous professionnels. » — **Sophie L.**
- « Appelé à 23h pour un trajet de dernière minute vers Roissy : réponse immédiate et prise en
  charge impeccable. » — **Karim B.**
- « Ponctuel, discret et rassurant. Le prix fixe pour l'aéroport, c'est un vrai confort :
  aucune mauvaise surprise. » — **Élodie M.**

Prévoir un lien vers l'ensemble des avis Google (ajouté dès que la fiche Google Business
Profile sera disponible).

**CTA :** Rejoignez des clients sereins — [téléphone]

---

## 08 — Contact / Réservation

*Interactif · formulaire*

Section de fin de page : reprend les coordonnées et propose le formulaire en dernier recours,
pour les visiteurs qui ne veulent ni appeler ni WhatsApp dans l'instant.

**Titre :** Réservez votre trajet dès maintenant

> Réservation immédiate ou anticipée, 24h/24 et 7j/7. Le plus rapide reste l'appel : votre
> chauffeur vous confirme le tarif et l'horaire en direct.

**Bloc coordonnées :**
- **Téléphone** — le plus rapide — [numéro]
- **WhatsApp** — [numéro]
- **Email** — [adresse email]
- **Base** — L'Haÿ-les-Roses (94240) — [adresse complète]
- **Disponibilité** — 24h/24, 7j/7, jours fériés
- **Paiement** — Espèces

**CTA :**
- Appeler maintenant *(principal)*
- Réserver par WhatsApp *(secondaire)*
- Micro-réassurance : « Réponse rapide · Tarifs aéroport fixes · Chauffeur ponctuel »

### Formulaire *(dernier recours, sous les CTA principaux)*

Champs :
- Nom *(requis)*
- Téléphone *(requis)*
- Email *(requis)*
- Date souhaitée *(optionnel)*
- Heure souhaitée *(optionnel)*
- Lieu de départ *(optionnel)*
- Destination *(optionnel)*
- Message *(optionnel, zone de texte)*

Autres éléments :
- **Case à cocher (requise)** — consentement de transmission des données à un service tiers
  (traitement des demandes), aucune donnée conservée par le site.
- **Bouton d'envoi** — « Envoyer ma demande », état de chargement « Envoi en cours… ».
- **État de succès** — message de confirmation discret (ex. bandeau vert doux) : « Votre
  demande a bien été envoyée. Nous vous recontactons rapidement. »
- **État d'erreur** — message de repli invitant à appeler directement, avec le bouton d'appel.

---

## Footer (global)

*Statique · persistant*

Fond contrasté (plus sombre que le reste de la page) pour marquer la fin de contenu. Répète
les coordonnées essentielles et les CTA une dernière fois.

- **Bloc identité** — nom, ville (CP), horaires, mode de paiement, langue.
- **CTA** — bouton appel + bouton WhatsApp.
- **Mention légale** — copyright, année courante, nom de l'entreprise.

Le footer doit prévoir un espace bas suffisant sur mobile pour ne pas être masqué par le
bouton d'appel flottant.

---

## Bouton d'appel flottant (mobile)

*Global · mobile uniquement*

Le levier de conversion n°1 sur mobile. Barre pleine largeur, fixée en bas d'écran, toujours
visible pendant le scroll.

- Un seul bouton : **« Appeler maintenant — [téléphone] »**.
- Hauteur confortable (cible tactile large, min. 44px), fond contrasté fort pour rester
  lisible en toute condition de luminosité.
- Doit respecter la zone de sécurité en bas d'écran (encoche / barre de gestes iOS).
- N'apparaît pas sur desktop/tablette : le bouton d'appel de l'en-tête prend le relais.

---

## Notes transverses

### Accessibilité & mobile
- Cibles tactiles ≥ 44px sur tous les boutons et champs.
- Contraste texte/fond conforme AA.
- Mobile-first : chaque section doit fonctionner en une colonne avant d'être élargie.
- La carte du simulateur ne doit jamais bloquer le scroll vertical de la page sur mobile.

### Structure des titres
- Un seul **H1** : le titre du hero (section 01).
- Toutes les autres sections utilisent des **H2** (et H3 pour les sous-titres, ex. « Votre
  véhicule »).

### Placeholders à remplacer avant mise en ligne
- Numéro de téléphone, numéro WhatsApp, adresse email, adresse postale complète.
- Les 4 avis clients (actuellement fictifs).
- Intitulé exact de la gare « Marne-la-Vallée Chessy » — à confirmer avec le client.
- Photo réelle du véhicule (Kia Niro hybride gris foncé) — aucune image fournie à ce stade.
