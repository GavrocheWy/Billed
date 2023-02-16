/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES_PATH, ROUTES } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import BillsUI from "../views/BillsUI.js";
import store from "../__mocks__/store.js";
import userEvent from '@testing-library/user-event'
import router from "../app/Router.js";

// Set user in localstorage
Object.defineProperty(window, 'localStorage', { value: localStorageMock })
window.localStorage.setItem('user', JSON.stringify({
  type: 'Employee',
  email: 'a@a'
}))

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {

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

    // The form should appear with nine inputs

  })

  describe("When I want to add a new bill", () => {

    describe("When I put a file who is an image (jpg, jpeg, png) in the file input", () => {
      test("Then the file name should appear in the file input", () => {

        const html = NewBillUI();
        document.body.innerHTML = html;

        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };

        const newBill = new NewBill({ document, onNavigate, store, localStorage: window.localStorage })
        const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e))
        const fileInput = screen.getByTestId('file');
        fileInput.addEventListener('change', handleChangeFile);

        fireEvent.change(fileInput, {
          target: {
            files: [new File(['image.jpg'], 'image.jpg', { type: 'image/jpg' })],
          }
        })

        expect(handleChangeFile).toHaveBeenCalled()
        expect(fileInput.files[0].name).toBe('image.jpg');

      })
    })

    describe("When I put a file who is not an image (png, jpg, jpeg) in the file input", () => {
      test("Then the file is declined and a error message appear", () => {

        const html = NewBillUI();
        document.body.innerHTML = html;

        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };

        const newBill = new NewBill({ document, onNavigate, store: null, localStorage: window.localStorage })
        const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e))
        const appendFileErrorMessage = jest.fn(() => newBill.appendFileErrorMessage())
        const fileInput = screen.getByTestId('file');
        fileInput.addEventListener('change', handleChangeFile);
        fileInput.addEventListener('change', appendFileErrorMessage);

        fireEvent.change(fileInput, {
          target: {
            files: [new File(['bill.pdf'], 'bill.pdf', { type: 'application/pdf' })],
          }
        })

        expect(handleChangeFile).toHaveBeenCalled()
        expect(appendFileErrorMessage).toHaveBeenCalled()

      })
    })

    describe("When I put the right information in the form", () => {
      test("Then it creates a new bill", () => {

        const html = NewBillUI();
        document.body.innerHTML = html;

        const newBillDatas = {
          type: 'Transports',
          name: 'Lorem ipsum',
          datepicker: '2023-02-09',
          amount: '1000',
          vat: '20',
          pct: '20',
          commentary: 'Lorem ipsum dolor sit amet',
          file: new File(['image'], 'image.png', { type: 'image/png' }),
        }

        const newBillForm = screen.getByTestId('form-new-bill')
        const billName = screen.getByTestId('expense-name')
        const billType = screen.getByTestId('expense-type')
        const billDate = screen.getByTestId('datepicker')
        const billAmount = screen.getByTestId('amount')
        const billTVA = screen.getByTestId('vat')
        const billPCT = screen.getByTestId('pct')
        const billCommentary = screen.getByTestId('commentary')
        const billFile = screen.getByTestId('file')

        fireEvent.change(billType, {
          target: { value: newBillDatas.type },
        })
        expect(billType.value).toBe(newBillDatas.type)

        fireEvent.change(billName, {
          target: { value: newBillDatas.name },
        })
        expect(billName.value).toBe(newBillDatas.name)

        fireEvent.change(billDate, {
          target: { value: newBillDatas.datepicker },
        })
        expect(billDate.value).toBe(newBillDatas.datepicker)

        fireEvent.change(billAmount, {
          target: { value: newBillDatas.amount },
        })
        expect(billAmount.value).toBe(newBillDatas.amount)

        fireEvent.change(billTVA, {
          target: { value: newBillDatas.vat },
        })
        expect(billTVA.value).toBe(newBillDatas.vat)

        fireEvent.change(billPCT, {
          target: { value: newBillDatas.pct },
        })
        expect(billPCT.value).toBe(newBillDatas.pct)

        fireEvent.change(billCommentary, {
          target: { value: newBillDatas.commentary },
        })
        expect(billCommentary.value).toBe(newBillDatas.commentary)

        userEvent.upload(billFile, newBillDatas.file)
        expect(billFile.files[0]).toStrictEqual(newBillDatas.file)
        expect(billFile.files).toHaveLength(1)

        Object.defineProperty(window, 'localStorage', {
          value: {
            getItem: jest.fn(() =>
              JSON.stringify({
                email: 'employee@test.tld',
              })
            )
          }
        })

        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }

        const newBill = new NewBill({
          document,
          onNavigate,
          localStorage: window.localStorage,
        })

        const handleSubmit = jest.fn(newBill.handleSubmit)
        newBillForm.addEventListener('submit', handleSubmit)
        fireEvent.submit(newBillForm)
        expect(handleSubmit).toHaveBeenCalled()

      })
    })

  })

})

describe("Given I am connected as an employee", () => {
  describe("When I navigate to New Bills", () => {

    // Test if the new bill page is loaded
    test('Then the newBill page should be rendered', () => {
      document.body.innerHTML = NewBillUI();
      expect(screen.getAllByText('Envoyer une note de frais')).toBeTruthy();
    });

    // Test if the new bill page display a form with nine fields
    test('Then a nine fields form should appear', () => {
      document.body.innerHTML = NewBillUI();
      const newBillForm = document.querySelector('form');
      expect(newBillForm.length).toEqual(9);
    })

    // Test if the 404 error page appear when an error 404 occurs
    test("Then it fails with a 404 message error", async () => {
      const html = BillsUI({ error: 'Erreur 404' })
      document.body.innerHTML = html;
      expect(screen.getByText('Erreur 404')).toBeTruthy();
    })

    // Test if the 500 error page appear when an error 500 occurs
    test("Then it fails with a 500 message error", async () => {
      const html = BillsUI({ error: 'Erreur 500' })
      document.body.innerHTML = html;
      expect(screen.getByText('Erreur 500')).toBeTruthy();
    })

  })
})