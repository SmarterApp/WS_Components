import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { CenterDecorator } from '../CenterDecorator';
import { Layout } from '../../src';
import { RouterDecorator } from '../RouterDecorator';
import { Link, NavLink } from 'react-router-dom';
import { SiteLinks } from './mocks';


const body = <div className="test-container"><p>Test Body</p></div>
storiesOf("Layout", module)
    .addDecorator(RouterDecorator)
    .addDecorator(CenterDecorator)
    .add("name no links no body", () => <Layout siteName="Test" />)
    .add("name links and body", () => <Layout children={body} siteName="Test" links={SiteLinks} />)