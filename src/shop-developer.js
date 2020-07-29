import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '@polymer/paper-dialog';
import '@google-pay/button-element';
import '@granite-elements/ace-widget';
import './shop-button.js';
import './shop-common-styles.js';
import { getGooglePayConfig } from './shop-configuration.js';

function filterPaymentRequest(paymentRequest) {
  const { callbackIntents, ...request } = paymentRequest;

  return request;
}

const googlepayConfig = getGooglePayConfig();
const defaultPaymentRequest = filterPaymentRequest(googlepayConfig.paymentRequest);

class ShopDeveloper extends PolymerElement {
  static get template() {
    return html`
    <style include="shop-common-styles">
      .title {
        display: flex;
        flex-direction: row;
      }

      .title h3 {
        flex-grow: 1;
      }

      .title span {
        display: inline-block;
        margin-top: 1.15em;
      }

      @media (max-width: 600px) {
        paper-dialog {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          margin: 0;
        }
      }

      @media (min-width: 601px) {
        paper-dialog {
            width: calc(100% - 20px);
            max-width: 1000px;
            height: calc(100% - 20px);
            max-height: 1000px;
        }
      }

      #buttonRow {
        text-align: center;
        margin: 10px;
      }

      #aceWidgetResponse, #aceWidget {
        width: 100%;
        height: 100%;
      }

    </style>

    <paper-dialog id="dialog" style="overflow:auto;">
      <div>
        <div class="title">
          <h3>Developer Console</h3>
          <span>Edit in <a href="https://jsfiddle.net/6aso0xkr/" target="_blank">JSFiddle</a></span>
        </div>
        <ace-widget
          id="aceWidget"
          mode="ace/mode/json"
          theme="ace/theme/monokai"
          tab-size="2"
          initialFocus
        ></ace-widget>
        <div class="row" id="buttonRow">
          <google-pay-button id="googlePayButton"
            environment="[[googlepayConfig.environment]]"
            payment-request="[[paymentRequest]]"
            button-type="[[googlepayConfig.appearance.buttonType]]"
            button-color="[[googlepayConfig.appearance.buttonColor]]"
            on-load-payment-data="[[_onGooglePayPaymentDataResult]]"
            on-error="[[_onGooglePayError]]"
            on-cancel="[[_onGooglePayCancel]]"
          ></google-pay-button>
        </div>
        <div id="response">
          <h3>Response</h3>
          <ace-widget
            id="aceWidgetResponse"
            mode="ace/mode/json"
            theme="ace/theme/solarized_light"
            tab-size="2"
            readonly
          ></ace-widget>
        </div>
      </div>
    </paper-dialog>
    `;

  }

  constructor() {
    super();

    this._handleEditorChanged = this._handleEditorChanged.bind(this);
    this._onGooglePayPaymentDataResult = this._onGooglePayPaymentDataResult.bind(this);
    this._onGooglePayError = this._onGooglePayError.bind(this);
    this._onGooglePayCancel = this._onGooglePayCancel.bind(this);
  }

  static get is() { return 'shop-developer'; }

  static get properties() { return {

    googlepayConfig: {
      type: Object,
      value: () => googlepayConfig,
    },

  }}

  get paymentRequest() {
    return this._paymentRequest || defaultPaymentRequest;
  }

  connectedCallback() {
    super.connectedCallback();
    this.$.aceWidget.addEventListener('editor-content', this._handleEditorChanged);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.$.aceWidget.removeEventListener('editor-content', this._handleEditorChanged);
  }

  _handleEditorChanged() {
    const paymentRequest = this.getEditorValue();
    this.$.googlePayButton.paymentRequest = paymentRequest;
  }

  open() {
    const value = this.$.aceWidget.editor.getValue();
    if (!value) {
      this.setEditorValue(defaultPaymentRequest);
    }
    this.$.aceWidgetResponse.editor.renderer.setShowGutter(false);
    this.$.dialog.open();
  }

  getEditorValue() {
    try {
      return JSON.parse(this.$.aceWidget.editor.getValue());
    } catch (err) {
      return undefined;
    }
  }

  setEditorValue(obj) {
    this._paymentRequest = filterPaymentRequest(obj);
    this.$.aceWidget.editor.setValue(JSON.stringify(this._paymentRequest, null, '  '));
    this.$.aceWidget.editor.resize();
    this.$.dialog.refit();
  }

  setResponseValue(obj) {
    this.$.aceWidgetResponse.editor.setValue(JSON.stringify(obj, null, '  '));
    this.$.aceWidgetResponse.editor.resize();
    this.$.dialog.refit();
  }

  _onGooglePayPaymentDataResult(paymentResponse) {
    this.setResponseValue(paymentResponse);
  }

  _onGooglePayError(error) {
    this.setResponseValue(error);
  }

  _onGooglePayCancel(reason) {
    this.setResponseValue(reason);
  }

}

customElements.define(ShopDeveloper.is, ShopDeveloper);
