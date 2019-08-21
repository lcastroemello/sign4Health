# ONLINE PETITION FOR UNIVERSAL HEALTHCARE WORLDWIDE

## Description:

Online petition in favour of having universal public healthcare in all the countries in the world. 

## Developed with: 

- PostgreSQL for database management
- Express-handlebars / node-JS for server management
- JavaScript - Handlebars for modular built of pages
- Bcryptjs for password encription
- Cookie-session for cookie encription
- FrontEnd JavaScript for signature management using HTML Canvas
- HTML/CSS
  - Media Queries for better mobile phone experience
- Deployed online through Herokuapp

## Features:

Initial page that allows users to register for the first time or login in case their already have an account:

- Tailor made error messages allow user to correct problems on both login and registration

<img src='./welcomepage.gif' />

Access to an "About" page already from the welcome page (unlogged users) with diverse links explaining the importance of the petition matter

	- This page has its own mobile phone design for better experience

<img src='./aboutpage.gif' />

On registration, user can also provide aditional (optional) information about themselves or skip directly into signing the petition

<img src='./moreinfo.gif' />

To confirm its interest on signing the petition, our users have to sign a unique signature on the canvas space available. If they are still not sure, they can choose to go to the about page and read more about the cause. 

<img src='./signature.gif' />

After signing, users are forwarded to a thank you page, where they can see their signature and how many people are already supporting the cause. 

- This thank you page will welcome all users that signed once they log in again. 

- Registered users that still haven't signed the petition will be forwarded to the signing page upon login. 

Another option from that page forwards them to the signer's list, only accessible after you have signed the petition. In there users have the option to see only signers from a specific city by clicking on it's name or to visit the personal webpage of signers, in case they chose to put that information on their profile 

<img src='./listofsigners.gif' />

From the thank you page, users can also see and alter their profile information, as well as add or remove optional information about themselves, being then forwarded to the list of users who signed

<img src='./userprofile.gif' />

## Features to be added:

- Option to erase your signature on the signature page in case of mistakes
- Option to alter your signature from the user profile page
- Option to remove your signature but remain registered
- Option to delete your account

