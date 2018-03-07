import * as React from "react";
import {
  AboutItemRevisionModel,
  AccResourceGroupModel,
  AdvancedAboutItem,
  ItemAccessibilityModal,
  ItemViewerFrame,
  ResourceSelectionsModel,
  RevisionContainer,
  Revision,
  ItemRevisionModel,
  itemRevisionKey,
  getItemBankName,
  RevisionModel,
  RubricModal
} from "../index";

export interface ItemBankViewerProps {
  onAccessibilityUpdate: (accResourceGroups: AccResourceGroupModel[]) => void;
  onAccessibilityReset: () => void;
  onItemSelect: (direction: "next" | "previous") => void;
  onRevisionSelect: (revision: string) => void;
  itemUrl?: string;
  aboutItemRevisionModel?: AboutItemRevisionModel;
  accResourceGroups?: AccResourceGroupModel[];
  revisions?: RevisionModel[];
  nextItem?: ItemRevisionModel;
  prevItem?: ItemRevisionModel;
}

export class ItemBankViewer extends React.Component<ItemBankViewerProps, {}> {
  constructor(props: ItemBankViewerProps) {
    super(props);
  }

  handleAccessibilityChange = (accResource: ResourceSelectionsModel) => {
    console.error("Not Implemented");
  };

  renderRightNav(): JSX.Element | undefined {
    const {
      onAccessibilityUpdate,
      onAccessibilityReset,
      accResourceGroups
    } = this.props;

    let content: JSX.Element | undefined;
    if (accResourceGroups) {
      content = (
        <div
          className="item-nav-right-group"
          role="group"
          aria-label="Second group"
        >
          <ItemAccessibilityModal
            accResourceGroups={accResourceGroups}
            onSave={this.handleAccessibilityChange}
            onReset={onAccessibilityReset}
          />
        </div>
      );
    }

    return content;
  }

  renderMidNav() {
    const { onItemSelect, nextItem, prevItem } = this.props;
    const nextItemName = nextItem ? getItemBankName(nextItem) : "";
    const previousItemName = prevItem ? getItemBankName(prevItem) : "";

    return (
      <div className="nav-buttons">
        <button
          onClick={() => onItemSelect("previous")}
          className="btn btn-link previous"
          disabled={prevItem ? false : true}
        >
          <span className="fa fa-arrow-left" aria-hidden="true" />
          {`Previous ${previousItemName}`}
        </button>
        <button
          onClick={() => onItemSelect("next")}
          className="btn btn-link next"
          disabled={nextItem ? false : true}
        >
          {`Next ${nextItemName}`}
          <span className="fa fa-arrow-right" aria-hidden="true" />
        </button>
      </div>
    );
  }

  renderRubricModal(): JSX.Element | undefined {
    const { aboutItemRevisionModel } = this.props;
    let content: JSX.Element | undefined;
    if (
      aboutItemRevisionModel &&
      aboutItemRevisionModel.sampleItemScoring &&
      aboutItemRevisionModel.sampleItemScoring.rubrics
    ) {
      const rubrics = aboutItemRevisionModel.sampleItemScoring.rubrics;
      content = <RubricModal rubrics={rubrics} />;
    }

    return content;
  }

  renderNavBar(): JSX.Element | undefined {
    const { aboutItemRevisionModel, accResourceGroups } = this.props;
    let content: JSX.Element | undefined;
    if (aboutItemRevisionModel && accResourceGroups) {
      content = (
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
            <AdvancedAboutItem {...aboutItemRevisionModel} />
            {this.renderRubricModal()}
          </div>
          {this.renderMidNav()}
          {this.renderRightNav()}
        </div>
      );
    }

    return content;
  }

  render() {
    const { itemUrl, revisions, onRevisionSelect } = this.props;

    return (
      <div className="section revisions-items">
        <RevisionContainer
          revisions={revisions || []}
          onRevisionSelect={onRevisionSelect}
        />
        <div
          className="section item-map-iframe"
          aria-live="polite"
          aria-relevant="additions removals"
        >
          {this.renderNavBar()}
          <ItemViewerFrame url={itemUrl} title={"item viewer"} />
        </div>
      </div>
    );
  }
}