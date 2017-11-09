﻿import '../Styles/about.less';
import '../Styles/item.less';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as $ from 'jquery';
import { AboutItem } from '../AboutItem/AboutItem';
import { AboutItemModel } from '../AboutItem/AboutItemModels';
import { ItemFrame } from '../ItemViewer/ItemViewerFrame';
import { Resource, get } from '../ApiModel';
import { RouteComponentProps } from 'react-router';
import { AboutTestItemsModel, InteractionTypeModel } from './AboutTestItemsModels';

export interface AboutTestItemContainerState {
    selectedCode?: string;
    itemUrl?: string;
    aboutThisItemViewModel: Resource<AboutItemModel>;
    aboutItemsViewModel: Resource<AboutTestItemsModel>;

}

export interface AboutTestItemContainerProps extends RouteComponentProps<{}> {
    aboutClient: (params?: { interactionTypeCode: string }) => Promise<AboutTestItemsModel>;
}

export class AboutTestItemsContainer extends React.Component<AboutTestItemContainerProps, AboutTestItemContainerState>{
    constructor(props: AboutTestItemContainerProps) {
        super(props);
        this.state = {
            aboutThisItemViewModel: { kind: "loading" },
            aboutItemsViewModel: { kind: "loading" }
        }
        this.props.aboutClient().then((data) => this.onFetchedUpdatedViewModel(data)).catch();

    }

    handleChange = (e: React.FormEvent<HTMLSelectElement>) => {
        const newCode = e.currentTarget.value
        if (newCode === this.state.selectedCode) {
            return;
        }

        this.fetchUpdatedViewModel(newCode);
    }

    fetchUpdatedViewModel(newCode: string) {
        const params = {
            interactionTypeCode: newCode
        };

        this.props.aboutClient(params).then((data) => this.onFetchedUpdatedViewModel(data)).catch();
    }

    onFetchedUpdatedViewModel = (viewModel: AboutTestItemsModel) => {
        if (!viewModel) {
            console.log("An error occurred updating the item.");
            return;
        }

        this.setState({
            itemUrl: viewModel.itemUrl,
            selectedCode: viewModel.selectedInteractionTypeCode,
            aboutThisItemViewModel: { kind: "success", content: viewModel.aboutThisItemViewModel },
            aboutItemsViewModel: { kind: "success", content: viewModel }

        });
    }

    renderDescription(interactionTypes: InteractionTypeModel[]) {
        let desc = "";
        for (let it of interactionTypes) {
            if (it.code === this.state.selectedCode && it.description) {
                desc = it.description;
            }
        }

        return (
            <div aria-live="polite" aria-relevant="text"
                dangerouslySetInnerHTML={{ __html: desc }} className="aboutitems-desc" />
        );
    }

    renderInteractionTypesSelect(interactionTypes: InteractionTypeModel[]) {
        let items: JSX.Element[] = [];
        for (let i of interactionTypes) {
            items.push(
                <option key={i.code} value={i.code}> {i.label} </option>
            );
        }

        return (
            <select className="form-control" onChange={this.handleChange}>
                {items}
            </select>
        );
    }

    openAboutItemModal(e: React.KeyboardEvent<HTMLAnchorElement>) {
        if (e.keyCode === 13 || e.keyCode === 23) {
            const modal: any = ($("#about-item-modal-container"));
            modal.modal();
        }
    }

    renderNoItem() {
        return (
            <div className="no-item">
                <p>No items of the selected type found.</p>
            </div>
        );
    }

    renderItemFrame() {
        const aboutThisItem = this.state.aboutThisItemViewModel;
        if ((aboutThisItem.kind == "success" || aboutThisItem.kind == "reloading") && aboutThisItem.content) {
            return (
                <div className="aboutitem-iframe" aria-live="polite" aria-relevant="additions removals" >
                    <div className="item-nav" role="toolbar" aria-label="Toolbar with button groups">
                        <div className="item-nav-left-group" role="group" aria-label="First group">
                            <a className="item-nav-btn" data-toggle="modal" data-target="#about-item-modal-container"
                                onKeyUp={e => this.openAboutItemModal(e)} role="button" tabIndex={0}>
                                <span className="glyphicon glyphicon-info-sign glyphicon-pad" aria-hidden="true" />
                                About This Item
                        </a>
                        </div>
                    </div>
                    <ItemFrame url={this.state.itemUrl || ""} />
                    <AboutItem {...aboutThisItem.content} />
                </div>
            );
        }
        else {
            return this.renderNoItem();
        }


    }

    private renderItemTypesGroup() {
        const aboutItems = this.state.aboutItemsViewModel;
        if ((aboutItems.kind == "success" || aboutItems.kind == "reloading") && aboutItems.content) {

            return (
                <div>
                    <div className="aboutitems-dropdown form-group">
                        {this.renderInteractionTypesSelect(aboutItems.content.interactionTypes)}
                    </div>
                    {this.renderDescription(aboutItems.content.interactionTypes)}
                </div>
            );
        }
        else {
            return <p><em>Loading...</em></p>
        }
    }

    public render() {
        const itemFrame = this.state.itemUrl ? this.renderItemFrame() : this.renderNoItem();
        return (
            <div className="about-items">
                <div className="aboutitems-parents">
                    <div className="aboutitems-info">
                        <h1>About Test Items</h1>
                        <div className="aboutitems-text">
                            Smarter Balanced assessments use a variety of item
                             types to accurately measure what students know and can do.
                             To learn more and see an example item, select an item type below.
                        </div>
                        {this.renderItemTypesGroup()}
                    </div>
                    {itemFrame}
                </div>
            </div>
        );
    }
}
