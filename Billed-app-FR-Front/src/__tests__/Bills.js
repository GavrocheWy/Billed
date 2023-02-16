/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH, ROUTES } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import Bills from '../containers/Bills.js'
import router from "../app/Router.js";
import mockStore from "../__mocks__/store"

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {

    // Test if the bill icon is highlighted
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

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

    // Test if bills are organized from earliest to latest
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

  })
})

// Test employee interactions - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    describe("When I click on an eye icon", () => {
      test("It should open the bill modal", () => {
        const html = BillsUI({
          data: bills
        });
        document.body.innerHTML = html;
        const store = undefined;
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };
        const billsList = new Bills({ document, onNavigate, store, localStorage: window.localStorage, });
        // modal oppening
        $.fn.modal = jest.fn();
        const icon = screen.getAllByTestId('icon-eye')[0];
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
    describe("When I click on 'Send new bill' button", () => {
      test("It should navigate to 'New bill' page", () => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.append(root)
        router()
        window.onNavigate(ROUTES_PATH.Bills)
        const store = null;
        const billsList = new Bills({ document, onNavigate, store, localStorage: window.localStorage, });
        // navigate to New Bill
        const handleClickNewBill = jest.fn(() => billsList.handleClickNewBill)
        const navigationButton = screen.getByTestId('btn-new-bill');
        navigationButton.addEventListener('click', handleClickNewBill);
        fireEvent.click(navigationButton)
        expect(screen.getAllByText('Envoyer une note de frais')).toBeTruthy()
      })
    })
  })
})

// Get bills and display errors and loading messages - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
describe("Given I am connected as an employee", () => {
  describe("When I navigate to Bills", () => {

    // Test if the loading page is displayed
    test('First, loading page should be rendered', () => {
      document.body.innerHTML = BillsUI({ loading: true });
      expect(screen.getAllByText('Loading...')).toBeTruthy();
    });

    // Test if the bills are loaded
    test('Get bills from mocked datas', () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: 'a@a'
      }))

      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)

      // navigate to bills page
      const pathname = ROUTES_PATH['Bills']
      root.innerHTML = ROUTES({ pathname: pathname, loading: true })

      // init bills page with mocked bills
      const bills = new Bills({ document, onNavigate, store: mockStore, localStorage })
      bills.getBills().then(data => {
        root.innerHTML = BillsUI({ data })
        expect(document.querySelector('tbody').rows.length).toBeGreaterThan(0)
      })

    })

    describe('In case of an error occurs with the API', () => {

      // Test if the 404 error page appear when an error 404 occurs
      test("Display error 404 page when failing to fetch bills", () => {
        const html = BillsUI({ error: 'Erreur 404' })
        document.body.innerHTML = html;
        expect(screen.getByText('Erreur 404')).toBeTruthy();
      })

      // Test if the 500 error page appear when an error 500 occurs
      test("Display error 500 page when failing to fetch bills", () => {
        const html = BillsUI({ error: 'Erreur 500' })
        document.body.innerHTML = html;
        expect(screen.getByText('Erreur 500')).toBeTruthy();
      })

    })

  })
})