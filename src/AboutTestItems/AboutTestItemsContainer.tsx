import * as React from "react";
import * as ReactDOM from "react-dom";
import * as $ from "jquery";
import {
  AboutItem,
  AboutItemModel,
  ItemViewerFrame,
  LoadingOverlay
} from "../index";
import { Resource, getRequest, getResourceContent } from "../ApiModel";
import { RouteComponentProps } from "react-router";
import {
  AboutTestItemsModel,
  InteractionTypeModel,
  AboutTestItemsParams
} from "./AboutTestItemsModels";

export interface AboutTestItemContainerState {
  selectedCode?: string;
  itemUrl?: string;
  aboutThisItemViewModel: Resource<AboutItemModel>;
  aboutItemsViewModel: Resource<AboutTestItemsModel>;
  hasError: boolean;
  loading: boolean;
}

export interface AboutTestItemContainerProps
  extends RouteComponentProps<AboutTestItemsParams> {
  aboutClient: (
    params?: { interactionTypeCode: string }
  ) => Promise<AboutTestItemsModel>;
}

export class AboutTestItemsContainer extends React.Component<
  AboutTestItemContainerProps,
  AboutTestItemContainerState
> {
  constructor(props: AboutTestItemContainerProps) {
    super(props);
    this.state = {
      aboutThisItemViewModel: { kind: "loading" },
      aboutItemsViewModel: { kind: "loading" },
      selectedCode: this.props.match.params.itemType,
      hasError: false,
      loading: true
    };
  }

  componentDidMount() {
    this.fetchUpdatedViewModel(this.state.selectedCode);
  }

  handleChange = (e: React.FormEvent<HTMLSelectElement>) => {
    const newCode = e.currentTarget.value;
    if (newCode !== this.state.selectedCode) {
      this.setState({
        selectedCode: newCode
      });

      this.fetchUpdatedViewModel(newCode);
    }
  };

  fetchUpdatedViewModel(newCode?: string) {
    const params = {
      interactionTypeCode: newCode || ""
    };

    this.props
      .aboutClient(params)
      .then(data => this.onFetchedUpdatedViewModel(data))
      .catch(err => this.onError(err));
  }

  onError(err: Error) {
    this.setState({
      aboutThisItemViewModel: { kind: "failure" },
      aboutItemsViewModel: { kind: "failure" },
      loading: false,
      hasError: true
    });
  }

  onFetchedUpdatedViewModel = (viewModel: AboutTestItemsModel) => {
    const { interactionTypes, aboutThisItemViewModel } = viewModel;
    let selectedCode = this.state.selectedCode;

    if (interactionTypes.length > 0) {
      if (!selectedCode) {
        selectedCode = interactionTypes[0].code;
      } else {
        const validType = interactionTypes.find(it => it.code === selectedCode);
        selectedCode = validType ? selectedCode : interactionTypes[0].code;
      }
    }

    this.setState({
      selectedCode,
      itemUrl: viewModel.itemUrl,
      aboutThisItemViewModel: {
        kind: "success",
        content: aboutThisItemViewModel
      },
      aboutItemsViewModel: { kind: "success", content: viewModel },
      hasError: false,
      loading: false
    });
  };

  renderDescription(interactionTypes: InteractionTypeModel[]) {
    let desc = "";
    for (const it of interactionTypes) {
      if (it.code === this.state.selectedCode && it.description) {
        desc = it.description;
      }
    }

    return (
      <div
        aria-live="polite"
        aria-relevant="text"
        dangerouslySetInnerHTML={{ __html: desc }}
        className="section about-items-desc"
      />
    );
  }

  renderInteractionTypesSelect(interactionTypes: InteractionTypeModel[]) {
    let items: JSX.Element[] = [];
    for (const i of interactionTypes) {
      items.push(
        <option key={i.code} value={i.code}>
          {" "}
          {i.label}{" "}
        </option>
      );
    }

    return (
      <select
        className="form-control"
        onChange={this.handleChange}
        value={this.state.selectedCode}
      >
        {items}
      </select>
    );
  }

  renderNoItem() {
    return (
      <div className="section section-light no-item">
        <p>No items of the selected type found.</p>
      </div>
    );
  }

  renderItemFrame() {
    const aboutThisItem = this.state.aboutThisItemViewModel;
    if (
      (aboutThisItem.kind === "success" ||
        aboutThisItem.kind === "reloading") &&
      aboutThisItem.content
    ) {
      return (
        <div
          className="about-item-iframe"
          aria-live="polite"
          aria-relevant="additions removals"
        >
          <div
            className="item-nav"
            role="toolbar"
            aria-label="Toolbar with button groups"
          >
            <div
              className="item-nav-left-group"
              role="group"
              aria-label="First group"
            >
              <AboutItem {...aboutThisItem.content} />
            </div>
          </div>
          <ItemViewerFrame url={this.state.itemUrl || ""} />
        </div>
      );
    } else {
      return this.renderNoItem();
    }
  }

  private renderItemTypesGroup() {
    const aboutItems = this.state.aboutItemsViewModel;
    if (
      (aboutItems.kind === "success" || aboutItems.kind === "reloading") &&
      aboutItems.content
    ) {
      return (
        <div>
          <div className="about-items-dropdown form-group">
            {this.renderInteractionTypesSelect(
              aboutItems.content.interactionTypes
            )}
          </div>
          {this.renderDescription(aboutItems.content.interactionTypes)}
        </div>
      );
    } else {
      return (
        <p>
          <em>Loading...</em>
        </p>
      );
    }
  }

  private renderError() {
    let content = null;
    if (this.state.hasError) {
      content = (
        <div className="page-error">
          <p aria-label="Network error occurred">
            Network failure, please try again
          </p>
        </div>
      );
    }

    return content;
  }

  public render() {
    const itemFrame = this.state.itemUrl
      ? this.renderItemFrame()
      : this.renderNoItem();

    return (
      <LoadingOverlay loading={this.state.loading}>
        <div className="container about-items">
          <div className="aboutitems-parents">
            <div className="aboutitems-info">
              <h1>About Test Items</h1>
              {this.renderError()}
              <div className="aboutitems-text">
                Smarter Balanced assessments use a variety of item types to
                accurately measure what students know and can do. To learn more
                and see an example item, select an item type below.
              </div>
              {this.renderItemTypesGroup()}
            </div>
            {itemFrame}
          </div>
        </div>
      </LoadingOverlay>
    );
  }
}
