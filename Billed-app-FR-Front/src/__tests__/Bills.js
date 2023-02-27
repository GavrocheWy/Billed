/**
 * @jest-environment jsdom
 */

import { fireEvent, screen } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH, ROUTES } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import Bills from '../containers/Bills.js'
import router from "../app/Router.js";
import mockStore from "../__mocks__/store"

// Set user in localstorage
Object.defineProperty(window, 'localStorage', { value: localStorageMock })
window.localStorage.setItem('user', JSON.stringify({
  type: 'Employee',
  email: 'a@a'
}))

// onNavigate initialization
const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({ pathname });
};

// Test unitaires - - - - - - - - - - - - - - - - - - - - - - - - - - - -

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {

    // The bill icon whould be highlighted
    test("Then bill icon in vertical layout should be highlighted", async () => {
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      const pathname = ROUTES_PATH['Bills']
      root.innerHTML = ROUTES({ pathname: pathname, loading: true })
      window.onNavigate(ROUTES_PATH.Bills)
      const windowIcon = screen.getByTestId('icon-window')
      const iconActivated = windowIcon.classList.contains('active-icon')
      expect(iconActivated).toBeTruthy()
    })

    // Bills are organized from earliest to latest
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    // As an employee, I can click on the blue eye icon to open a modal
    describe('When I click on an eye icon', () => {
      test('It should open the bill modal with the file inside', () => {
        document.body.innerHTML = BillsUI({ data: bills })
        const store = [];
        const billsList = new Bills({ document, onNavigate, store, localStorage: window.localStorage, });
        const icon = screen.getAllByTestId('icon-eye')[0];
        $.fn.modal = jest.fn();
        const handleClickIconEye = jest.fn(() =>
          billsList.handleClickIconEye(icon)
        );
        icon.addEventListener('click', handleClickIconEye);
        fireEvent.click(icon);
        expect(handleClickIconEye).toHaveBeenCalled();
        const modale = document.getElementById('modaleFile');
        expect(modale).toBeTruthy();
      })
    })

    // As an employee, I can click on the new bill button to add a new bill
    describe('When I click on the new bill button', () => {
      test('It should navigate to the "New bill" page', () => {
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.append(root)
        router()
        window.onNavigate(ROUTES_PATH.Bills)
        const store = [];
        const billsList = new Bills({ document, onNavigate, store, localStorage: window.localStorage, });
        const handleClickNewBill = jest.fn(() => billsList.handleClickNewBill)
        const newBillButton = screen.getByTestId('btn-new-bill');
        newBillButton.addEventListener('click', handleClickNewBill);
        fireEvent.click(newBillButton)
        expect(screen.getAllByText('Envoyer une note de frais')).toBeTruthy()
      })
    })

  })
})

// Test d'intégration GET

describe("Given I am connected as an employee", () => {
  describe("When I navigate to Bills", () => {

    // The loading page should be rendered
    test('Loading page should be rendered', () => {
      document.body.innerHTML = BillsUI({ loading: true });
      expect(screen.getAllByText('Loading...')).toBeTruthy();
    });

    // The bills are loadeds from mocked datas (store)
    test('Get bills from mocked datas', async () => {

      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      const pathname = ROUTES_PATH['Bills']

      root.innerHTML = ROUTES({ pathname: pathname, loading: true })
      const bills = new Bills({ document, onNavigate, store: mockStore, localStorage })

      bills.getBills().then(data => {
        root.innerHTML = BillsUI({ data })
        expect(document.querySelector('tbody').rows.length).toBeGreaterThan(0)
        // Based on mockStore first item
        expect(data[0]).toStrictEqual({
          id: '47qAXb6fIm2zOKkLzMro',
          vat: '80',
          fileUrl: 'https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a',
          status: 'En attente',
          type: 'Hôtel et logement',
          commentary: 'séminaire billed',
          name: 'encore',
          fileName: 'preview-facture-free-201801-pdf-1.jpg',
          date: '4 Avr. 04',
          amount: 400,
          commentAdmin: 'ok',
          email: 'a@a',
          pct: 20
        })
      })

    })

    // The 404 error should display the 404 error page
    test("Display error 404 page when failing to fetch bills", () => {
      const html = BillsUI({ error: 'Erreur 404' })
      document.body.innerHTML = html;
      expect(screen.getByText('Erreur 404')).toBeTruthy();
    })

    // The 500 error should display the 500 error page
    test("Display error 500 page when failing to fetch bills", () => {
      const html = BillsUI({ error: 'Erreur 500' })
      document.body.innerHTML = html;
      expect(screen.getByText('Erreur 500')).toBeTruthy();
    })

  })

})