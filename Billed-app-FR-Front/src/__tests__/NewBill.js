/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom"
import { expect, jest, test } from '@jest/globals';
import NewBillUI from "../views/NewBillUI.js"
import BillsUI from "../views/BillsUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES_PATH, ROUTES } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"
import router from "../app/Router.js";

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
  describe("When I am on New Bill Page", () => {

    // The mail icon whould be highlighted
    test("Then mail icon in vertical layout should be highlighted", async () => {
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      const pathname = ROUTES_PATH['New Bills']
      root.innerHTML = ROUTES({ pathname: pathname, loading: true })
      window.onNavigate(ROUTES_PATH.NewBill)
      const windowIcon = screen.getByTestId('icon-mail')
      const iconActivated = windowIcon.classList.contains('active-icon')
      expect(iconActivated).toBeTruthy()
    })

    // The new bill page is loaded with a nine fields form
    test('Then the newBill page should be rendered', () => {
      document.body.innerHTML = NewBillUI();
      const newBillForm = screen.getByTestId('form-new-bill');
      expect(screen.getAllByText('Envoyer une note de frais')).toBeTruthy();
      expect(newBillForm).toBeTruthy();
      expect(newBillForm.length).toEqual(9);
    });

  })

})

// Test d'intégration (post) - - - - - - - - - - - - - - - - - - - - - - - - - -

describe("Given I am connected as an employee", () => {
  describe("When I want to add a new bill", () => {

    describe('When I add a new file as the bill receipt', () => {

      describe("When I put a file who is an image in the file input", () => {
        test("Then the file name should appear in the file input", () => {

          const html = NewBillUI();
          document.body.innerHTML = html;
          const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage })

          const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e))
          const fileInput = screen.getByTestId('file');
          fileInput.addEventListener('change', handleChangeFile);

          const billFile = new File(['image.jpg'], 'image.jpg', { type: 'image/jpg' })

          fireEvent.change(fileInput, {
            target: {
              files: [billFile],
            }
          })

          expect(handleChangeFile).toHaveBeenCalled()
          expect(fileInput.files[0].name).toBe('image.jpg');

        })
      })

      describe("When I put a file who is not an image in the file input", () => {
        test("Then the file name should not appear in the file input and a error message appear", () => {

          const html = NewBillUI();
          document.body.innerHTML = html;
          const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage })

          const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e))
          const appendFileErrorMessage = jest.fn(() => newBill.appendFileErrorMessage())
          const fileInput = screen.getByTestId('file');
          fileInput.addEventListener('change', handleChangeFile);
          fileInput.addEventListener('change', appendFileErrorMessage);

          const badBillFile = new File(['document.pdf'], 'document.pdf', { type: 'application/pdf' })

          fireEvent.change(fileInput, {
            target: {
              files: [badBillFile],
            }
          })

          expect(handleChangeFile).toHaveBeenCalled()
          expect(appendFileErrorMessage).toHaveBeenCalled()
          expect(fileInput.value).toBe('');

        })
      })

    })

    describe("When I put the right information in the form", () => {

      test("Then it creates a new bill", () => {

        const html = NewBillUI();
        document.body.innerHTML = html;
        const newBill = new NewBill({ document, onNavigate, localStorage: window.localStorage, })
        const email = JSON.parse(localStorage.getItem("user")).email

        const newBillForm = screen.getByTestId('form-new-bill')
        const handleSubmit = jest.fn(newBill.handleSubmit)
        newBillForm.addEventListener('submit', handleSubmit)
        fireEvent.submit(newBillForm)
        newBill.onNavigate(ROUTES_PATH['Bills'])
  
        expect(handleSubmit).toHaveBeenCalled()
        expect(screen.getAllByText('Mes notes de frais')).toBeTruthy()

      })

      test('Then the post request fail into an error 404', async () => {
        const html = BillsUI({ error: 'Erreur 404' });
        document.body.innerHTML = html;
        expect(screen.getByText('Erreur 404')).toBeTruthy();
      });

      test('Then the post request fail into an error 500', async () => {
        const html = BillsUI({ error: 'Erreur 500' });
        document.body.innerHTML = html;
        expect(screen.getByText('Erreur 500')).toBeTruthy();
      });

    })

  })
})